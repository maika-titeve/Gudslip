document.addEventListener('alpine:init', () => {
  Alpine.data('ThemeModule_ModalCart', ({ openOnAddToCart }) => {
    return {
      init() {
        if (openOnAddToCart === true) {
          document.body.addEventListener(
            'shapes:modalcart:afteradditem',
            () => {
              Alpine.store('modals').open('cart');
            }
          );
        }

        Alpine.store('modals').register('cart', 'rightDrawer');
      },
    };
  });
});


(function() {
  const originalFetch = window.fetch;

  window.fetch = function(...args) {
    if (args[0] && typeof args[0] === 'string' && args[0].includes('/cart/add.js')) {
      return originalFetch.apply(this, args).then(res => {
        // Clonar para leer la respuesta sin consumirla
        res.clone().json().then(() => {
          // Obtener las secciones actualizadas
          fetch('?sections=cart-items,cart-footer,cart-item-count,cart-live-region')
            .then(r => r.json())
            .then(data => {
              // Disparar el evento que Alpine usa para actualizar contenido
              document.body.dispatchEvent(
                new CustomEvent('shapes:modalcart:afteradditem', {
                  bubbles: true,
                  detail: { response: { sections: data } }
                })
              );

              // Abrir el drawer
              Alpine.store('modals').open('cart');
            });
        });

        return res;
      });
    }

    return originalFetch.apply(this, args);
  };
})();