
class ProductDetailsGellary extends HTMLElement{
  constructor() {
    super()
    this.scrollSliderSelector = `.${this.dataset.scrollSelector}`
    this.thumbSliderSelector = `.${this.dataset.thumbSelector}`
    
    this.thumbSlideType = this.dataset.slideType
    this.scrollSliderDirection = this.dataset.direction
    this.verticalSlideMarginBottom = 8
    this.isThumbSlider = this.dataset.isThumb

    this.scrollSlider = null
    this.thumbSlider = null

    this.initScrollSlider()
    this.initThumbSlider()

    // if(this.scrollSliderDirection==='vertical' && screen.width > 768 && this.isThumbSlider === 'true') this.querySelector(this.scrollSliderSelector).style.height = this.querySelector(this.thumbSliderSelector).clientHeight - 16 + 'px'
  }

  initScrollSlider() {
    this.scrollSlider = new Swiper(this.scrollSliderSelector, {
      slidesPerView:  screen.width > 768 ? this.scrollSliderDirection==='vertical' ? 'auto': 6 : 6,
      spaceBetween: this.verticalSlideMarginBottom,
      direction: screen.width > 768 ? this.scrollSliderDirection : 'horizontal'
    })
  }

  initThumbSlider() {
    this.thumbSlider = new Swiper(this.thumbSliderSelector, {
      slidesPerView: 1,
      autoHeight: true,
      effect: this.thumbSlideType,
      pagination: {
       el: '.swiper-pagination',
       clickable: true
      },
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
      thumbs: {
       swiper: this.isThumbSlider === 'true' ? this.scrollSlider : '',
      },
      breakpoints: {
        100: {
          autoHeight: true
        },
        769: {
          autoHeight: false
        }
      }
    })
  }
}
customElements.define("pd-gellary", ProductDetailsGellary)


class QuantitySelector extends HTMLElement{
  constructor() {
    super()
    this.querySelectorAll("button").forEach(btn => btn.addEventListener("click", this.handleQtyButton.bind(this)))
    this.qty_input = this.querySelector("input")
  }

  handleQtyButton(e) {
    let value = parseInt(e.currentTarget.dataset.value),
        current_value = parseInt(this.qty_input.value) + value
    current_value < 1 ? current_value = 1 : current_value
    this.qty_input.value = current_value
  }
}
customElements.define("quantity-selector", QuantitySelector)


class ProductVariant extends HTMLElement{
  constructor() {
    super()
    this.sectionId = this.dataset.sectionId
    this.productId = this.dataset.productId
    this.swiperClass = `.swiper-${this.productId}-${this.sectionId}`
    this.section = document.querySelector(`#shopify-section-${this.sectionId}`)

    this.getVariantData()
    this.getAllSlide()

    this.sliderElement = this.section.querySelector("pd-gellary")
    
    this.form = this.querySelector("form")
    this.form?.addEventListener("input", this.handleInputEvents.bind(this))
  }

  getAllSlide() {
    this.slidesEl = document.querySelectorAll(".pd-thumb-swiper .swiper-slide")
    this.slidesArr = []
    this.slidesEl.forEach(slide => {
       this.slidesArr = [...this.slidesArr, {
         index: parseInt(slide.dataset.index),
         src: slide.dataset.src
       }]
    })
  }
  
  getVariantData() {
    this.variantData = this.variantData || JSON.parse(this.querySelector('[type="application/json"]')?.textContent);
  }
  
  handleInputEvents(e) {
    this.updateOptions()
    this.updateMasterId()
    this.updateURL()
    this.renderProductInfo()
    this.updateSlide()
  }

  updateOptions() {
    this.options = Array.from(this.querySelectorAll('.pd-variant-field'), (element) => {
        return Array.from(element.querySelectorAll('input')).find((radio) => radio.checked)?.value;
    });
  }

  updateMasterId() {
    this.currentVariant = this.variantData.find((variant) => {
      return !variant.options
        .map((option, index) => {
          return this.options[index] === option;
        })
        .includes(false);
    });
  }
  
  updateURL() {
    if (!this.currentVariant || this.dataset.updateUrl === 'false') return;
    window.history.replaceState({}, '', `${this.dataset.url}?variant=${this.currentVariant.id}`);
  }
  
  updateSlide() {
    if(this.currentVariant && this.currentVariant.featured_image) {
      let variant = this.slidesArr.find(item => this.currentVariant.featured_image.src.includes(item.src))
      // let variant = this.slidesArr.find(item => item.src ===  this.currentVariant.featured_image.src)
      if(variant) this.sliderElement.thumbSlider.slideTo(variant.index)
    }
  }
  
  renderProductInfo() {
    const requestedVariantId = this.currentVariant.id;  
    fetch(
      `${this.dataset.url}?variant=${requestedVariantId}&section_id=${this.sectionId}`
    )
    .then((response) => response.text())
    .then((responseText) => {
      if (this.currentVariant.id !== requestedVariantId || this.section === null) return;
      
      const html = new DOMParser().parseFromString(responseText, 'text/html');
      if(this.section.querySelector(".pd-variant-wrapper")) this.section.querySelector(".pd-variant-wrapper").innerHTML = html.querySelector(".pd-variant-wrapper").innerHTML
      if(this.section.querySelector(".pd-product-price")) this.section.querySelector(".pd-product-price").innerHTML = html.querySelector(".pd-product-price").innerHTML
      if(this.section.querySelector(".pd-product-stock")) this.section.querySelector(".pd-product-stock").innerHTML = html.querySelector(".pd-product-stock").innerHTML
      if(this.section.querySelector(".pd-current-variant-id")) this.section.querySelector(".pd-current-variant-id").innerHTML = html.querySelector(".pd-current-variant-id").innerHTML
      if(this.section.querySelector(".pd-atc-button-wrapper")) this.section.querySelector(".pd-atc-button-wrapper").innerHTML = html.querySelector(".pd-atc-button-wrapper").innerHTML
      if(this.currentVariant.available) {
        if(this.section.querySelector("pd-form")) this.section.querySelector("pd-form").removeAttribute('hidden')
        if(this.section.querySelector(".notify-stock-button-x")) this.section.querySelector(".notify-stock-button-x").setAttribute('hidden', true)
      } else {
        if(this.section.querySelector("pd-form")) this.section.querySelector("pd-form").setAttribute('hidden', true)
        if(this.section.querySelector(".notify-stock-button-x")) this.section.querySelector(".notify-stock-button-x").removeAttribute('hidden')
      }
    })
    .catch(err => console.log(err))
    .finally(() => {
      // initQuickAddProduct()
    })
  }
}

customElements.define("pd-variant", ProductVariant)
