// Quick Add Modal Thumbnail Gallery Functionality
(function() {
  'use strict';

  function initThumbnailGallery() {
    const modals = document.querySelectorAll('quick-add-modal');
    
    modals.forEach(modal => {
      const mediaList = modal.querySelector('.product__media-list');
      if (!mediaList) return;

      const mainImageItem = mediaList.querySelector('.product__media-item:first-child');
      const thumbnailItems = Array.from(mediaList.querySelectorAll('.product__media-item:not(:first-child)'));
      
      if (!mainImageItem || thumbnailItems.length === 0) return;

      const mainImage = mainImageItem.querySelector('img');
      if (!mainImage) return;

      // Store original main image source (the first/default image)
      const originalMainImageSrc = mainImage.src || mainImage.getAttribute('src');
      const originalMainImageSrcset = mainImage.srcset || mainImage.getAttribute('srcset');
      
      // Store original in data attributes for easy restoration
      mainImage.dataset.originalSrc = originalMainImageSrc;
      mainImage.dataset.originalSrcset = originalMainImageSrcset || '';

      thumbnailItems.forEach((thumbnailItem, index) => {
        const thumbnailImage = thumbnailItem.querySelector('img');
        if (!thumbnailImage) return;

        // Add click handler to change main image
        thumbnailItem.addEventListener('click', function() {
          clearTimeout(hoverTimeout);
          // Update main image
          const newSrc = thumbnailImage.src || thumbnailImage.getAttribute('src');
          const newSrcset = thumbnailImage.srcset || thumbnailImage.getAttribute('srcset') || newSrc;
          
          // Update original to this clicked image
          mainImage.dataset.originalSrc = newSrc;
          mainImage.dataset.originalSrcset = newSrcset;
          
          // Update main image with fade effect
          mainImage.style.opacity = '0';
          setTimeout(() => {
            mainImage.src = newSrc;
            if (newSrcset) {
              mainImage.srcset = newSrcset;
            }
            mainImage.style.opacity = '1';
            mainImage.style.transition = 'opacity 0.3s ease';
          }, 50);
          
          // Update active state
          thumbnailItems.forEach(item => item.classList.remove('is-active'));
          thumbnailItem.classList.add('is-active');
        });

        // Add hover handler for preview (shows on hover, restores on leave)
        let hoverTimeout;
        thumbnailItem.addEventListener('mouseenter', function() {
          clearTimeout(hoverTimeout);
          const hoverSrc = thumbnailImage.src || thumbnailImage.getAttribute('src');
          const hoverSrcset = thumbnailImage.srcset || thumbnailImage.getAttribute('srcset') || hoverSrc;
          
          // Store current image if not already stored
          if (!mainImage.dataset.currentSrc) {
            mainImage.dataset.currentSrc = mainImage.src;
            mainImage.dataset.currentSrcset = mainImage.srcset || '';
          }
          
          // Change main image on hover
          mainImage.style.opacity = '0.7';
          setTimeout(() => {
            mainImage.src = hoverSrc;
            if (hoverSrcset) {
              mainImage.srcset = hoverSrcset;
            }
            mainImage.style.opacity = '1';
            mainImage.style.transition = 'opacity 0.2s ease';
          }, 50);
        });

        thumbnailItem.addEventListener('mouseleave', function() {
          clearTimeout(hoverTimeout);
          // Restore to original/default image when hover ends
          hoverTimeout = setTimeout(() => {
            if (mainImage.dataset.originalSrc) {
              mainImage.style.opacity = '0.7';
              setTimeout(() => {
                mainImage.src = mainImage.dataset.originalSrc;
                if (mainImage.dataset.originalSrcset) {
                  mainImage.srcset = mainImage.dataset.originalSrcset;
                }
                mainImage.style.opacity = '1';
                mainImage.style.transition = 'opacity 0.2s ease';
              }, 50);
            }
          }, 100);
        });
      });

      // Set first thumbnail as active by default
      if (thumbnailItems.length > 0) {
        thumbnailItems[0].classList.add('is-active');
      }
    });
  }

  // Initialize when modal content is loaded
  document.addEventListener('DOMContentLoaded', function() {
    initThumbnailGallery();
  });

  // Re-initialize when modal opens (for dynamically loaded content)
  document.addEventListener('product-info:loaded', function() {
    setTimeout(initThumbnailGallery, 100);
  });

  // Also listen for modal open events
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.type === 'attributes' && mutation.attributeName === 'open') {
        const modal = mutation.target;
        if (modal.hasAttribute('open')) {
          setTimeout(initThumbnailGallery, 200);
        }
      }
    });
  });

  // Observe all quick-add-modals
  document.querySelectorAll('quick-add-modal').forEach(modal => {
    observer.observe(modal, { attributes: true, attributeFilter: ['open'] });
  });

  // Re-observe when new modals are added
  const modalObserver = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      mutation.addedNodes.forEach(function(node) {
        if (node.nodeType === 1 && node.tagName === 'QUICK-ADD-MODAL') {
          observer.observe(node, { attributes: true, attributeFilter: ['open'] });
        }
      });
    });
  });

  modalObserver.observe(document.body, { childList: true, subtree: true });
})();

