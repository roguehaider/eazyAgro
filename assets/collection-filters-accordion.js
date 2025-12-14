/**
 * Collection Filters Accordion Behavior
 * Ensures only one filter is open at a time
 */
(function() {
  'use strict';
  
  let filterDetails = [];
  let initialized = false;
  
  function initializeFilterAccordion() {
    // Get all filter details elements (horizontal filters)
    filterDetails = Array.from(document.querySelectorAll('.facets__form .js-filter details, .facets__form-vertical .js-filter details'));
    
    if (filterDetails.length === 0) {
      initialized = false;
      return;
    }
    
    // Remove existing listeners to prevent duplicates
    filterDetails.forEach((detail) => {
      // Clone and replace to remove all event listeners
      const newDetail = detail.cloneNode(true);
      detail.parentNode.replaceChild(newDetail, detail);
    });
    
    // Re-query after cloning
    filterDetails = Array.from(document.querySelectorAll('.facets__form .js-filter details, .facets__form-vertical .js-filter details'));
    
    filterDetails.forEach((detail) => {
      // Remove the open attribute from all except the first one initially
      if (!initialized && detail !== filterDetails[0]) {
        detail.removeAttribute('open');
      }
      
      // Add click handler to summary to close others first, before opening
      const summary = detail.querySelector('summary');
      if (summary) {
        summary.addEventListener('click', function(e) {
          const wasOpen = detail.open;
          
          // Always close all other open filters first
          let hasOpenFilters = false;
          filterDetails.forEach((otherDetail) => {
            if (otherDetail !== detail && otherDetail.open) {
              otherDetail.removeAttribute('open');
              hasOpenFilters = true;
            }
          });
          
          // If there were open filters, prevent default and manually toggle after a brief delay
          if (hasOpenFilters && !wasOpen) {
            e.preventDefault();
            e.stopPropagation();
            
            // Close others first, then open this one
            setTimeout(() => {
              detail.setAttribute('open', '');
            }, 50);
          }
        }, { passive: false, capture: true }); // Use capture phase to run before default behavior
      }
      
      detail.addEventListener('toggle', function(e) {
        // If this detail is being opened
        if (this.open) {
          // Close all other details (double check)
          filterDetails.forEach((otherDetail) => {
            if (otherDetail !== this && otherDetail.open) {
              otherDetail.removeAttribute('open');
            }
          });
        }
      }, { passive: true });
    });
    
    initialized = true;
  }
  
  // Initialize on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeFilterAccordion);
  } else {
    initializeFilterAccordion();
  }
  
  // Re-initialize after AJAX filter updates
  const observer = new MutationObserver(function(mutations) {
    let shouldReinit = false;
    mutations.forEach(function(mutation) {
      if (mutation.addedNodes.length > 0) {
        // Check if any added node is a filter detail
        Array.from(mutation.addedNodes).forEach(function(node) {
          if (node.nodeType === 1 && (node.matches && (node.matches('.js-filter details') || node.querySelector('.js-filter details')))) {
            shouldReinit = true;
          }
        });
      }
      if (mutation.type === 'attributes' && mutation.attributeName === 'open') {
        shouldReinit = true;
      }
    });
    if (shouldReinit) {
      setTimeout(initializeFilterAccordion, 200);
    }
  });
  
  // Observe the facets container for changes
  function observeFacetsContainer() {
    const facetsContainer = document.querySelector('.facets-container, #FacetsWrapperDesktop, .facets__form, .facets__form-vertical');
    if (facetsContainer) {
      observer.observe(facetsContainer, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['open']
      });
    } else {
      // Retry after a short delay if container not found
      setTimeout(observeFacetsContainer, 500);
    }
  }
  
  observeFacetsContainer();
  
  // Also listen for custom events from facets.js
  document.addEventListener('facet:updated', function() {
    setTimeout(initializeFilterAccordion, 300);
  });
})();

