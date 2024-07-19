/*
 * Copyright 2000-2020 Vaadin Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

import { html, PolymerElement } from '@polymer/polymer/polymer-element';
import { ThemableMixin } from '@vaadin/vaadin-themable-mixin';
import { ElementMixin } from '@vaadin/component-base/src/element-mixin';
import { Overlay } from '@vaadin/vaadin-overlay/src/vaadin-overlay.js';
import '@vaadin/overlay';
import '@polymer/iron-media-query';

class RichTooltipOverlayElement extends Overlay {
  static get is() {
    return 'rich-tooltip-overlay';
  }
}

customElements.define(RichTooltipOverlayElement.is, RichTooltipOverlayElement);

class RichTooltip extends ElementMixin(ThemableMixin(PolymerElement)) {
  static get template() {
    return html`
      <style>
        :host {
          display: block;
        }
        :host([phone]) {
          top: 0 !important;
          right: 0 !important;
          bottom: var(--vaadin-overlay-viewport-bottom, 0) !important;
          left: 0 !important;
          align-items: stretch !important;
          justify-content: flex-end !important;
        }
        :host([phone]) [part="overlay"] {
          max-height: 50vh;
          width: 100vw;
          border-radius: 0;
          box-shadow: var(--lumo-box-shadow-xl);
        }
        /* The content part scrolls instead of the overlay part, because of the gradient fade-out */
        :host([phone]) [part="content"] {
          padding: 30px var(--lumo-space-m);
          max-height: inherit;
          box-sizing: border-box;
          -webkit-overflow-scrolling: touch;
          overflow: auto;
          -webkit-mask-image: linear-gradient(transparent, #000 40px, #000 calc(100% - 40px), transparent);
          mask-image: linear-gradient(transparent, #000 40px, #000 calc(100% - 40px), transparent);
        }
        :host([phone]) [part="backdrop"] {
          display: block;
        }
        /* Animations */
        :host([opening][phone]) [part="overlay"] {
          animation: 0.2s lumo-mobile-menu-overlay-enter cubic-bezier(.215, .61, .355, 1) both;
        }
        :host([closing][phone]),
        :host([closing][phone]) [part="backdrop"] {
          animation-delay: 0.14s;
        }
        :host([closing][phone]) [part="overlay"] {
          animation: 0.14s 0.14s lumo-mobile-menu-overlay-exit cubic-bezier(.55, .055, .675, .19) both;
        }
      </style>
      <rich-tooltip-overlay
        id="tooltipOverlay"
        opened="{{opened}}"
        theme$="[[theme]]"
        with-backdrop="[[_phone]]"
        phone$="[[_phone]]"
      >
      </rich-tooltip-overlay>
      <iron-media-query query="[[_phoneMediaQuery]]" query-matches="{{_phone}}"> </iron-media-query>
    `;
  }

  static get is() {
    return 'rich-tooltip';
  }

  static get version() {
    return '1.0.0';
  }
  /**
   * Object describing property-related metadata used by Polymer features
   */
  static get properties() {
    return {
      opened: {
        type: Boolean,
        value: false,
        reflectToAttribute: true
      },

      for: {
        type: String
      },

      /**
       * String used as a tooltip content.
       */
      text: {
        type: String,
        observer: '__textChanged',
      },

      _targetElement: {
        type: Object
      },

      _phone: Boolean,

      _phoneMediaQuery: {
        value: '(max-width: 420px), (max-height: 420px)'
      }
    };
  }

  /**
   * @protected
   */
  static _finalizeClass() {
    super._finalizeClass();
  }

  static get observers() {
    return ['_attachToTarget(for)'];
  }

  constructor() {
    super();
    this._boundShow = this._debounce(this.show.bind(this), 200);
    this._boundHide = this._debounce(this.hide.bind(this), 200);
  }

  ready() {
    super.ready();
	this.$.tooltipOverlay.innerHTML = this.text;
    this.$.tooltipOverlay.addEventListener('vaadin-overlay-open', () => this._tooltipOpenChanged(true));
    this.$.tooltipOverlay.addEventListener('vaadin-overlay-close', () => this._tooltipOpenChanged(false));
  }

  connectedCallback() {
    if (!this._targetElement) {
      this._targetElement = this.parentNode.querySelector(`#${this.for}`);
    }
    this._attachToTarget();
    super.connectedCallback();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._detachFromTarget();
  }

  show() {
	if (this.opened) return;
    this.opened = true;
    this._setPosition();
  }

  hide() {
	if (!this.opened) return;
    this.opened = false;
  }

  _attachToTarget() {
    if (!this._targetElement) {
      return;
    }
    this._targetElement.addEventListener('mouseenter', this._boundShow);
    this._targetElement.addEventListener('mouseout', this._boundHide);
  }

  _debounce(func, wait) {
    let timeout;
    return () => {
      if (timeout) {
          clearTimeout(timeout);
      }
      timeout = setTimeout(func, wait);
    }
  }
                        
  _detachFromTarget() {
    this._targetElement.removeEventListener('mouseenter', this._boundShow);
    this._targetElement.removeEventListener('mouseout', this._boundHide);
  }

  /** @private */
  __textChanged(text, oldText) {
    if (this._overlayElement && (text || oldText)) {
      this.$.tooltipOverlay.innerHTML = this.text;
    }
  }

  _setPosition() {
    const targetBoundingRect = this._targetElement.getBoundingClientRect();
    const overlayRect = this.$.tooltipOverlay.getBoundingClientRect();
    const positionLeft = targetBoundingRect.left + 10;
    const positionTop = targetBoundingRect.top + targetBoundingRect.height + window.pageYOffset - 2;

    if (positionLeft + overlayRect.width > window.innerWidth) {
      this.$.tooltipOverlay.style.right = '0px';
      this.$.tooltipOverlay.style.left = 'auto';
    } else {
      this.$.tooltipOverlay.style.left = `${Math.max(0, positionLeft)}px`;
      this.$.tooltipOverlay.style.right = 'auto';
    }

    if (positionTop + overlayRect.height > window.innerHeight + window.pageYOffset) {
      this.$.tooltipOverlay.style.top = `${positionTop - targetBoundingRect.height - overlayRect.height}px`;
    } else {
      this.$.tooltipOverlay.style.top = `${positionTop}px`;
    }
  }

  _tooltipOpenChanged(isOpened) {
    if (isOpened) {
      this._targetElement.addEventListener('mouseout', this._boundHide);
      this.$.tooltipOverlay.addEventListener('mouseout', this._boundHide);
      this.$.tooltipOverlay.addEventListener('click', this._boundHide);
      this.$.tooltipOverlay.addEventListener('mouseenter', this._boundShow);
    } else {
      this._targetElement.removeEventListener('mouseout', this._boundHide);
      this.$.tooltipOverlay.removeEventListener('mouseout', this._boundHide);
      this.$.tooltipOverlay.removeEventListener('click', this._boundHide);
      this.$.tooltipOverlay.removeEventListener('mouseenter', this._boundShow);
    }
    this.dispatchEvent(
      new CustomEvent('tooltip-open-changed', {
        detail: {
          opened: isOpened
        }
      })
    );
  }
}

customElements.define(RichTooltip.is, RichTooltip);

/**
 * @namespace Vaadin
 */
window.Vaadin.RichTooltip = RichTooltip;