document.addEventListener('DOMContentLoaded', function() {
  const cartIcon = document.getElementById('cart-icon');
  

  cartIcon.addEventListener('click', function(event) {
    event.preventDefault();
    // Assuming UpCart provides a JavaScript method to open the cart drawer
    if (typeof window.upcartOnCartOpened === 'function') {
      alert("open")
      // window.upcartOnCartOpened();
    } else {
      console.error('UpCart function is not available.');
    }
  });
});

document.addEventListener('DOMContentLoaded', function() {
  //   const pickystoryCartDrawer = function() {
  //       // Check if Pickystory app is available
  //       if (typeof Pickystory !== 'undefined' && Pickystory.CartDrawer) {
  //           // Open the Pickystory cart drawer
  //           Pickystory.CartDrawer.open();
  //       } else {
  //           console.error('Pickystory app is not loaded or CartDrawer functionality is not available.');
  //       }
  //   };

  //   // AJAX function to add item to cart and open Pickystory cart drawer
  //   function addItemToCart(form) {
  //       fetch('/cart/add.js', {
  //           method: 'POST',
  //           body: new FormData(form),
  //           headers: {
  //               'Accept': 'application/json'
  //           }
  //       })
  //       .then(response => response.json())
  //       .then(data => {
  //           // Optionally update the cart drawer with new items
  //           pickystoryCartDrawer();
  //       })
  //       .catch(error => console.error('Error:', error));
  //   }

  //   // Attach the AJAX add to cart event to your forms
  //   window.getAllForm = () => {
  //     document.querySelectorAll('form[action="/cart/add"]').forEach(form => {
  //       form.addEventListener('submit', function(event) {
  //           event.preventDefault();
  //           addItemToCart(form);
  //       });
  //     });
  //   }
  // getAllForm()
    
});
