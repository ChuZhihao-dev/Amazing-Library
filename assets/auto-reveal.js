const SECTION_SELECTOR = '.shopify-section:not(.header-section)';
const ROOT_SELECTOR = '.section, .product-information, featured-product-information, .cart-summary';
const INNER_WRAPPER_SELECTOR =
  '.section-content-wrapper, [class$="__inner"], .product-information__grid, .section-resource-list__content, .resource-list, .block-resource-list';
const EXCLUDE_SELECTOR =
  '.section-background, .custom-section-background, script, style, .sticky-add-to-cart, .menu-drawer, .menu-drawer__submenu, .mega-menu, .facets, .facets-block-wrapper, dialog, dialog-component, .background-overlay, .header__underlay';

class AutoReveal {
  constructor() {
    this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.isDesignMode = document.documentElement.classList.contains('shopify-design-mode');
    this.observer = null;
    this.mutationObserver = null;
  }

  init() {
    if (this.prefersReducedMotion || this.isDesignMode) return;
    this.observer = new IntersectionObserver(this.handleIntersect, {
      threshold: 0.14,
      rootMargin: '0px 0px -8% 0px',
    });

    this.decorateAll();
    document.documentElement.setAttribute('data-auto-reveal', 'active');

    document.addEventListener('shopify:section:load', this.handleSectionLoad);
    this.mutationObserver = new MutationObserver(this.handleMutations);
    this.mutationObserver.observe(document.body, { childList: true, subtree: true });
  }

  handleSectionLoad = (event) => {
    const section = event.target;
    if (!(section instanceof HTMLElement)) return;
    this.decorateSection(section);
  };

  handleMutations = (mutations) => {
    for (const mutation of mutations) {
      mutation.addedNodes.forEach((node) => {
        if (!(node instanceof HTMLElement)) return;
        if (node.matches?.(SECTION_SELECTOR)) {
          this.decorateSection(node);
        } else {
          node.querySelectorAll?.(SECTION_SELECTOR).forEach((section) => this.decorateSection(section));
        }
      });
    }
  };

  decorateAll() {
    document.querySelectorAll(SECTION_SELECTOR).forEach((section) => this.decorateSection(section));
  }

  decorateSection(section) {
    if (!(section instanceof HTMLElement)) return;

    const contentRoot = this.getContentRoot(section);
    if (!contentRoot) return;

    const targets = this.collectTargets(contentRoot).slice(0, 2);
    targets.forEach((target, index) => {
      if (!(target instanceof HTMLElement)) return;

      const kind = this.getKind(target);
      const staggerChildren = this.getStaggerChildren(target);

      if (staggerChildren.length >= 2) {
        staggerChildren.slice(0, 4).forEach((child, childIndex) => {
          this.bindTarget(child, kind === 'media' ? 'media' : 'list', index * 90 + childIndex * 80);
        });
        return;
      }

      this.bindTarget(target, kind, index * 90);
    });
  }

  getContentRoot(section) {
    const directRoot = Array.from(section.children).find((child) => {
      return child instanceof HTMLElement && child.matches(ROOT_SELECTOR);
    });

    if (directRoot instanceof HTMLElement) return directRoot;

    return Array.from(section.children).find((child) => this.isCandidate(child)) || null;
  }

  collectTargets(root) {
    const directChildren = Array.from(root.children).filter((child) => this.isCandidate(child));

    if (directChildren.length === 1 && directChildren[0] instanceof HTMLElement) {
      const only = directChildren[0];
      if (only.matches(INNER_WRAPPER_SELECTOR)) {
        const nested = Array.from(only.children).filter((child) => this.isCandidate(child));
        if (nested.length > 0) return nested;
      }
    }

    return directChildren;
  }


  getStaggerChildren(target) {
    if (!(target instanceof HTMLElement)) return [];

    const children = Array.from(target.children).filter((child) => this.isCandidate(child));
    if (children.length < 2) return [];

    const comparableChildren = children.filter((child) => {
      const rect = child.getBoundingClientRect();
      return rect.height > 40 && rect.width > 60;
    });

    if (comparableChildren.length < 2) return [];

    const firstHeight = comparableChildren[0]?.getBoundingClientRect().height || 0;
    const similarHeights = comparableChildren.every((child) => {
      const delta = Math.abs(child.getBoundingClientRect().height - firstHeight);
      return delta <= Math.max(24, firstHeight * 0.18);
    });

    if (!similarHeights && !target.matches('.resource-list, .section-resource-list__content, .block-resource-list, [class*="__grid"], .swiper-wrapper')) {
      return [];
    }

    return comparableChildren;
  }

  bindTarget(target, kind, delay) {
    if (!(target instanceof HTMLElement)) return;
    if (target.dataset.autoRevealBound === 'true') return;

    target.dataset.autoRevealBound = 'true';
    target.dataset.autoRevealKind = kind;
    target.style.setProperty('--auto-reveal-delay', `${delay}ms`);
    this.observer?.observe(target);
  }

  isCandidate(node) {
    if (!(node instanceof HTMLElement)) return false;
    if (node.matches(EXCLUDE_SELECTOR)) return false;
    if (node.closest(EXCLUDE_SELECTOR)) return false;
    if (node.hasAttribute('hidden')) return false;
    if (node.getAttribute('aria-hidden') === 'true') return false;

    const rect = node.getBoundingClientRect();
    if (rect.width < 48 || rect.height < 24) return false;

    return true;
  }

  getKind(node) {
    if (
      node.matches('.resource-list, .swiper, [class*="__grid"], .product-information__grid, .section-resource-list__content')
    ) {
      return 'list';
    }

    if (node.querySelector('img, media-gallery, .card-gallery, .product-media-container')) {
      return 'media';
    }

    return 'content';
  }

  handleIntersect = (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      if (!(entry.target instanceof HTMLElement)) return;

      entry.target.classList.add('is-visible');
      this.observer?.unobserve(entry.target);
    });
  };
}

const autoReveal = new AutoReveal();
autoReveal.init();
