/**
 * Tooto Enhanced Select Component
 * Uses Choices.js to globally replace select elements
 */

class TootoSelect {
  constructor() {
    this.observer = null;
    this.init();
  }

  init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupSelects());
    } else {
      this.setupSelects();
    }

    // Observe for dynamically added selects (important for apps)
    this.observeDynamicSelects();
  }

  setupSelects() {
    // Target selectors - customize based on your needs
    const selectors = [
      'select:not([data-choices-initialized])', // All selects not already initialized
      '.avpoptions-container__v2 select', // App-specific selects
      '.product-form__variants select',
      '.cart__select',
      '[data-custom-select]'
    ];

    selectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        this.initSingleSelect(element);
      });
    });
  }

  initSingleSelect(element) {
    // Skip if already initialized or if it should be ignored
    if (element.dataset && element.dataset.choicesInitialized) {
      return;
    }
    if (element.dataset && element.dataset.skipEnhancement) {
      return;
    }

    // Check if Choices is available
    if (typeof window.Choices === 'undefined') {
      return;
    }

    try {
      const choices = new window.Choices(element, {
        searchEnabled: false, // Disable search for single selects
        itemSelectText: '',
        shouldSort: false,
        position: 'auto',
        allowHTML: false,
        placeholderValue: (element.dataset && element.dataset.placeholder) || '',
        classNames: {
          containerOuter: 'choices',
          containerInner: 'choices__inner',
          input: 'choices__input',
          inputCloned: 'choices__input--cloned',
          list: 'choices__list',
          listItems: 'choices__list--multiple',
          listSingle: 'choices__list--single',
          listDropdown: 'choices__list--dropdown',
          item: 'choices__item',
          itemSelectable: 'choices__item--selectable',
          itemDisabled: 'choices__item--disabled',
          itemChoice: 'choices__item--choice',
          placeholder: 'choices__placeholder',
          group: 'choices__group',
          groupHeading: 'choices__heading',
          button: 'choices__button',
          activeState: 'is-highlighted',
          focusState: 'is-focused',
          openState: 'is-open',
          disabledState: 'is-disabled',
          selectedState: 'is-selected',
          flippedState: 'is-flipped',
          loadingState: 'is-loading',
          noResults: 'has-no-results',
          noChoices: 'has-no-choices'
        },
        // Callback for when value changes
        callbackOnChange: (event) => {
          // Trigger original change event for compatibility
          element.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });
      
      // Add our custom classes after initialization
      const container = element.closest('.choices');
      if (container) {
        container.classList.add('tooto-select');
        const inner = container.querySelector('.choices__inner');
        if (inner) inner.classList.add('tooto-select__inner');
        const list = container.querySelector('.choices__list');
        if (list) list.classList.add('tooto-select__list');
        const dropdown = container.querySelector('.choices__list--dropdown');
        if (dropdown) {
          dropdown.classList.add('tooto-select__dropdown');
        }
      }

      // Mark as initialized
      if (element.dataset) {
        element.dataset.choicesInitialized = 'true';
      }

      // Store instance for later access
      element._choicesInstance = choices;

    } catch (error) {
      // Silently handle errors
    }
  }

  observeDynamicSelects() {
    // Watch for new selects added by apps or AJAX
    this.observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // Check if the added node is a select or contains selects
            if (node.tagName === 'SELECT') {
              setTimeout(() => this.initSingleSelect(node), 100);
            } else if (node.querySelectorAll) {
              const selects = node.querySelectorAll('select:not([data-choices-initialized])');
              selects.forEach(select => {
                setTimeout(() => this.initSingleSelect(select), 100);
              });
            }
          }
        });
      });
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  initSelect(element) {
    if (typeof element === 'string') {
      element = document.querySelector(element);
    }
    if (element) {
      this.initSingleSelect(element);
    }
  }

  destroySelect(element) {
    if (typeof element === 'string') {
      element = document.querySelector(element);
    }
    if (element && element._choicesInstance) {
      element._choicesInstance.destroy();
      delete element._choicesInstance;
      if (element.dataset) {
        delete element.dataset.choicesInitialized;
      }
    }
  }

  // Cleanup method
  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
    
    // Destroy all instances
    const elements = document.querySelectorAll('[data-choices-initialized]');
    elements.forEach(element => {
      this.destroySelect(element);
    });
  }
}

// Auto-initialize
window.tootoSelect = new TootoSelect();

// Make available globally for manual control
window.TootoSelect = TootoSelect;
