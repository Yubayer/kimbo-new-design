class FilterAndSorting extends HTMLElement{
  constructor() {
    super()
    this.sectionId = this.dataset.sectionId
    this.section = document.querySelector(`#${this.sectionId}`)
    this.checkedLists = []
    this.handleSorting = this.handleSorting.bind(this)
    this.sortingEl = document.querySelector('sorting-el')
  }

  connectedCallback() {
    this.form = this.querySelector("form")
    this.form.querySelectorAll("input[type=checkbox]").forEach(input => input.addEventListener("click", this.handleInputEvents.bind(this)))
    
    this.form.querySelectorAll("input[type=range]").forEach(input => {
      input.addEventListener('change', this.handleInputNumberEvents(event))
      input.addEventListener('input', this.debounce((event) => {
        this.selectedList(true, true, null);
      }, 500).bind(this));
    })
  
    
    this.querySelectorAll(".url_to_remove").forEach(el => el.addEventListener("click", this.handleUrlToRemove.bind(this)))
    this.section.querySelector(".filter-button").addEventListener("click", this.handleDrawer.bind(this))
    this.querySelector(".close-drawer").addEventListener("click", this.handleDrawer.bind(this))
  }

  handleDrawer(e) {
    e.preventDefault()
    if(this.closest(".filter--container").classList.contains('active')) {
      this.closest(".filter--container").classList.remove("active")
      document.body.style.overflow = 'inherit'
    } else {
      this.closest(".filter--container").classList.add("active")
      document.body.style.overflow = 'hidden'
    }
    
  }

  handleUrlToRemove(e) {
    e.preventDefault()
    let url = e.target.href
    let params = url.split("?")[1]
    history.pushState({ params }, '', `${window.location.pathname}${params && '?'.concat(params)}`);
    this.renderSection()
  }

  handleInputNumberEvents(e) {
    let sliderTrack = document.querySelector(".range-slider-track");
    let sliderMaxValue = document.getElementById("slider-1").max;

    let ranges = document.querySelectorAll('.range-slider-container input')
    let displayValues = document.querySelectorAll('.range-current-price p')

    ranges.forEach((input, index) => input.addEventListener('input', e => {
        index === 0 ? this.rangeSlider(e, ranges, ranges[0], ranges[1], displayValues[0], sliderMaxValue, sliderTrack)
            : this.rangeSlider(e, ranges, ranges[1], ranges[0], displayValues[1], sliderMaxValue, sliderTrack)
    }))
  }

  rangeSlider(e, sliders, sliderX, sliderY, display, sliderMaxValue, sliderTrack) {
    if (parseInt(sliders[1].value) - parseInt(sliders[0].value) <= 0)
        sliderX.value = parseInt(sliderY.value) - 0;

    sliderX.classList.add('active-range-circle')
    sliderY.classList.remove('active-range-circle')

    display.textContent = sliderX.value;

    let percent1 = ((sliders[0].value / sliderMaxValue) * 100);
    let percent2 = ((sliders[1].value / sliderMaxValue) * 100);
    sliderTrack.style.background = `linear-gradient(to right, var(--range-line) ${percent1}% , var(--range-active-line) ${percent1}% , var(--range-active-line) ${percent2}%, var(--range-line) ${percent2}%)`; 
  }


  handleInputEvents(e) {
    this.selectedList(true, false, null)
  }
  selectedList(isParent, isPrice, sorting_select) {
    var checkedLists = []
    if(isParent) {
      checkedLists = [...checkedLists, this.sortingEl.selectedValue()]
    }
    if(sorting_select) {
      checkedLists = [...checkedLists, {
        name: sorting_select.name,
        value: sorting_select.value
      }]
    }
    this.form.querySelectorAll('input:checked').forEach(el => {
      checkedLists = [...checkedLists, {
        name: el.name,
        value: el.value
      }]
    })
    if(isPrice) {
      this.form.querySelectorAll('input[type=range]').forEach(el => {
        checkedLists = [...checkedLists, {
          name: el.name,
          value: el.value
        }]
      })
    }
    
    this.checkedLists = [...checkedLists]
    this.generateNewForm(checkedLists)
  }
  generateNewForm(checkedLists) {
    this.formData = new FormData() 
    checkedLists.forEach(list => this.formData.append(list.name, list.value))
    this.searchParams = new URLSearchParams(this.formData);
    this.updateURL(this.searchParams.toString())
    this.renderSection()
  }
  updateURL(searchParams) {
    history.pushState({ searchParams }, '', `${window.location.pathname}${searchParams && '?'.concat(searchParams)}`);
  }
  renderSection() {
    let url = `${location.pathname}?section_id=${this.sectionId}`
    if(this.searchParams) {
      url = `${location.pathname}?${this.searchParams.toString()}&section_id=${this.sectionId}`
    }
    fetch(url)
    .then(res => res.text())
    .then(res => {
      let html = new DOMParser().parseFromString(res, 'text/html')
      if(this.section.querySelector(".new-product-grid")) this.section.querySelector(".new-product-grid").innerHTML = html.querySelector(".new-product-grid").innerHTML
      if(this.section.querySelector(".filter--container")) this.section.querySelector(".filter--container").innerHTML = html.querySelector(".filter--container").innerHTML
      if(this.section.querySelector(".product-count")) this.section.querySelector(".product-count").innerHTML = html.querySelector(".product-count").innerHTML
    })
    .catch(err => console.log(err))
  }
  handleSorting(select) {
    this.selectedList(false, false, select.target)
  }
  debounce(fn, wait) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), wait);
    };
  }
}

customElements.define("filter-sorting", FilterAndSorting)


class Sorting extends HTMLElement{
  constructor() {
    super()
  }

  connectedCallback() {
    this.form = this.querySelector("form")
    this.form.addEventListener("input", this.handleInputEvents.bind(this))
  }

  selectedValue() {
    let select = this.form.querySelector("select")
    return {
      name: select.name,
      value: select.value
    }
  }
  
  handleInputEvents(e) {
    let filter_sorting_el = this.closest(".filter-and-sorting").querySelector("filter-sorting")
    filter_sorting_el.handleSorting(e)
  }

}

customElements.define("sorting-el", Sorting)