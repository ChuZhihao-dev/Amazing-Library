(function () {
  function formatMeters(totalCm) {
    var meters = totalCm / 100;
    if (Number.isInteger(meters)) {
      return String(meters) + 'm';
    }
    return String(meters).replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1') + 'm';
  }

  function updateDimension(root, type) {
    var metersSelect = root.querySelector('[data-' + type + '-meters]');
    var centimetersSelect = root.querySelector('[data-' + type + '-centimeters]');
    var displayEl = root.querySelector('[data-' + type + '-display]');
    var hiddenEl = root.querySelector('[data-' + type + '-hidden]');

    if (!metersSelect || !centimetersSelect || !displayEl || !hiddenEl) return;

    var meters = Number(metersSelect.value || 0);
    var centimeters = Number(centimetersSelect.value || 0);
    var totalCm = meters * 100 + centimeters;
    var formatted = formatMeters(totalCm);

    displayEl.textContent = formatted;
    hiddenEl.value = formatted;
  }

  function closeShapeMenu(picker) {
    var trigger = picker.querySelector('[data-shape-trigger]');
    var menu = picker.querySelector('[data-shape-menu]');

    if (!trigger || !menu) return;

    menu.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
  }

  function openShapeMenu(picker) {
    var trigger = picker.querySelector('[data-shape-trigger]');
    var menu = picker.querySelector('[data-shape-menu]');

    if (!trigger || !menu) return;

    menu.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
  }

  function syncShapePicker(picker, input) {
    var label = picker.querySelector('[data-shape-label]');
    var thumb = picker.querySelector('[data-shape-thumb]');
    var nextLabel = input.getAttribute('data-shape-text') || input.value;
    var nextImage = input.getAttribute('data-shape-image') || '';

    if (label) {
      label.textContent = nextLabel;
    }

    if (thumb && nextImage) {
      thumb.setAttribute('src', nextImage);
      thumb.setAttribute('alt', nextLabel);
    }
  }

  function setupShapePicker(root) {
    var picker = root.querySelector('[data-shape-picker]');
    if (!picker) return;

    var trigger = picker.querySelector('[data-shape-trigger]');
    if (!trigger) return;

    trigger.addEventListener('click', function () {
      var menu = picker.querySelector('[data-shape-menu]');
      if (!menu) return;

      if (menu.hidden) {
        openShapeMenu(picker);
      } else {
        closeShapeMenu(picker);
      }
    });

    picker.querySelectorAll('[data-shape-option]').forEach(function (input) {
      input.addEventListener('change', function () {
        if (!input.checked) return;
        syncShapePicker(picker, input);
        closeShapeMenu(picker);
      });
    });

    var checkedInput = picker.querySelector('[data-shape-option]:checked') || picker.querySelector('[data-shape-option]');
    if (checkedInput) {
      syncShapePicker(picker, checkedInput);
    }
  }

  function setupInfoTooltips(root) {
    root.querySelectorAll('.tooto-configurator__info-button').forEach(function (button) {
      if (!(button instanceof HTMLElement) || button.dataset.tootoTooltipReady === 'true') return;

      var tooltipText = button.getAttribute('data-tooltip') || button.getAttribute('aria-label') || button.getAttribute('title');
      if (!tooltipText) return;

      var wrapper = button.parentElement;
      if (!wrapper || !wrapper.classList.contains('tooto-configurator__info-wrap')) {
        wrapper = document.createElement('span');
        wrapper.className = 'tooto-configurator__info-wrap';
        button.parentNode.insertBefore(wrapper, button);
        wrapper.appendChild(button);
      }

      var tooltip = wrapper.querySelector('.tooto-configurator__tooltip');
      if (!tooltip) {
        tooltip = document.createElement('span');
        tooltip.className = 'tooto-configurator__tooltip';
        wrapper.appendChild(tooltip);
      }

      tooltip.textContent = tooltipText;
      button.dataset.tootoTooltipReady = 'true';
    });
  }

  function setupConfigurator(root) {
    if (root.dataset.tootoConfiguratorReady === 'true') return;
    root.dataset.tootoConfiguratorReady = 'true';

    updateDimension(root, 'width');
    updateDimension(root, 'length');

    root.querySelectorAll('[data-width-meters], [data-width-centimeters]').forEach(function (el) {
      el.addEventListener('change', function () {
        updateDimension(root, 'width');
      });
    });

    root.querySelectorAll('[data-length-meters], [data-length-centimeters]').forEach(function (el) {
      el.addEventListener('change', function () {
        updateDimension(root, 'length');
      });
    });

    setupShapePicker(root);
    setupInfoTooltips(root);
  }

  function initAll(scope) {
    (scope || document).querySelectorAll('[data-tooto-configurator]').forEach(setupConfigurator);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      initAll(document);
    });
  } else {
    initAll(document);
  }

  var observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      mutation.addedNodes.forEach(function (node) {
        if (!(node instanceof HTMLElement)) return;
        if (node.matches('[data-tooto-configurator]')) {
          setupConfigurator(node);
          return;
        }
        initAll(node);
      });
    });
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
})();
