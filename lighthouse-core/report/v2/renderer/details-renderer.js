/**
 * Copyright 2017 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

/* globals self */

class DetailsRenderer {
  /**
   * @param {!DOM} dom
   */
  constructor(dom) {
    /** @private {!DOM} */
    this._dom = dom;
  }

  /**
   * @param {!DetailsRenderer.DetailsJSON} details
   * @return {!Element}
   */
  render(details) {
    switch (details.type) {
      case 'text':
        return this._renderText(details);
      case 'url':
        return this._renderURL(details);
      case 'thumbnail':
        return this._renderThumbnail(details);
      case 'cards':
        return this._renderCards(/** @type {!DetailsRenderer.CardsDetailsJSON} */ (details));
      case 'table':
        return this._renderTable(/** @type {!DetailsRenderer.TableDetailsJSON} */ (details));
      case 'code':
        return this._renderCode(details);
      case 'node':
        return this._renderNode(/** @type {!DetailsRenderer.NodeDetailsJSON} */ (details));
      case 'list':
        return this._renderList(/** @type {!DetailsRenderer.ListDetailsJSON} */ (details));
      default:
        throw new Error(`Unknown type: ${details.type}`);
    }
  }

  /**
   * @param {!DetailsRenderer.DetailsJSON} text
   * @return {!Element}
   */
  _renderURL(text) {
    const element = this._renderText(text);
    element.classList.add('lh-text__url');
    return element;
  }

  /**
   * @param {!DetailsRenderer.DetailsJSON} text
   * @return {!Element}
   */
  _renderText(text) {
    const element = this._dom.createElement('div', 'lh-text');
    element.textContent = text.text;
    return element;
  }

  /**
   * Create small thumbnail with scaled down image asset.
   * If the supplied details doesn't have an image/* mimeType, then an empty span is returned.
   * @param {!DetailsRenderer.ThumbnailDetails} value
   * @return {!Element}
   */
  _renderThumbnail(value) {
    if (/^image/.test(value.mimeType) === false) {
      return this._dom.createElement('span');
    }

    const element = this._dom.createElement('img', 'lh-thumbnail');
    element.src = value.url;
    element.alt = '';
    element.title = value.url;
    return element;
  }

  /**
   * @param {!DetailsRenderer.ListDetailsJSON} list
   * @return {!Element}
   */
  _renderList(list) {
    if (!list.items.length) return this._dom.createElement('span');

    const element = this._dom.createElement('details', 'lh-details');
    if (list.header) {
      const summary = this._dom.createElement('summary', 'lh-list__header');
      summary.textContent = list.header.text;
      element.appendChild(summary);
    }

    const itemsElem = this._dom.createChildOf(element, 'div', 'lh-list__items');
    for (const item of list.items) {
      const itemElem = this._dom.createChildOf(itemsElem, 'span', 'lh-list__item');
      itemElem.appendChild(this.render(item));
    }
    return element;
  }


  /**
   * @param {!DetailsRenderer.TableDetailsJSON} details
   * @return {!Element}
   */
  _renderTable(details) {
    if (!details.items.length) return this._dom.createElement('span');

    const element = this._dom.createElement('details', 'lh-details');
    if (details.header) {
      element.appendChild(this._dom.createElement('summary')).textContent = details.header;
    }

    const tableElem = this._dom.createChildOf(element, 'table', 'lh-table');
    const theadElem = this._dom.createChildOf(tableElem, 'thead');
    const theadTrElem = this._dom.createChildOf(theadElem, 'tr');

    for (const heading of details.itemHeaders) {
      const itemType = heading.itemType || 'text';
      const classes = `lh-table-column--${itemType}`;
      this._dom.createChildOf(theadTrElem, 'th', classes).appendChild(this.render(heading));
    }

    const tbodyElem = this._dom.createChildOf(tableElem, 'tbody');
    for (const row of details.items) {
      const rowElem = this._dom.createChildOf(tbodyElem, 'tr');
      for (const columnItem of row) {
        const classes = `lh-table-column--${columnItem.type}`;
        this._dom.createChildOf(rowElem, 'td', classes).appendChild(this.render(columnItem));
      }
    }
    return element;
  }

  /**
   * @param {!DetailsRenderer.NodeDetailsJSON} item
   * @return {!Element}
   */
  _renderNode(item) {
    const element = this._dom.createElement('span', 'lh-node');
    element.textContent = item.snippet;
    element.title = item.selector;
    if (item.text) element.setAttribute('data-text', item.text);
    if (item.path) element.setAttribute('data-path', item.path);
    if (item.selector) element.setAttribute('data-selector', item.selector);
    if (item.snippet) element.setAttribute('data-snippet', item.snippet);
    return element;
  }

  /**
   * @param {!DetailsRenderer.CardsDetailsJSON} details
   * @return {!Element}
   */
  _renderCards(details) {
    const element = this._dom.createElement('details', 'lh-details');
    if (details.header) {
      element.appendChild(this._dom.createElement('summary')).textContent = details.header.text;
    }

    const cardsParent = this._dom.createElement('div', 'lh-scorecards');
    for (const item of details.items) {
      const card = cardsParent.appendChild(
          this._dom.createElement('div', 'lh-scorecard', {title: item.snippet}));
      const titleEl = this._dom.createElement('div', 'lh-scorecard__title');
      const valueEl = this._dom.createElement('div', 'lh-scorecard__value');
      const targetEl = this._dom.createElement('div', 'lh-scorecard__target');

      card.appendChild(titleEl).textContent = item.title;
      card.appendChild(valueEl).textContent = item.value;

      if (item.target) {
        card.appendChild(targetEl).textContent = `target: ${item.target}`;
      }
    }

    element.appendChild(cardsParent);
    return element;
  }

  /**
   * @param {!DetailsRenderer.DetailsJSON} details
   * @return {!Element}
   */
  _renderCode(details) {
    const pre = this._dom.createElement('pre', 'lh-code');
    pre.textContent = details.text;
    return pre;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = DetailsRenderer;
} else {
  self.DetailsRenderer = DetailsRenderer;
}

/**
 * @typedef {{
 *     type: string,
 *     text: (string|undefined)
 * }}
 */
DetailsRenderer.DetailsJSON; // eslint-disable-line no-unused-expressions

/**
 * @typedef {{
 *     type: string,
 *     header: ({text: string}|undefined),
 *     items: !Array<{type: string, text: (string|undefined)}>
 * }}
 */
DetailsRenderer.ListDetailsJSON; // eslint-disable-line no-unused-expressions

/**
 * @typedef {{
 *     type: string,
 *     text: (string|undefined),
 *     path: (string|undefined),
 *     selector: (string|undefined),
 *     snippet:(string|undefined)
 * }}
 */
DetailsRenderer.NodeDetailsJSON; // eslint-disable-line no-unused-expressions

/** @typedef {{
 *     type: string,
 *     header: ({text: string}|undefined),
 *     items: !Array<{title: string, value: string, snippet: (string|undefined), target: string}>
 * }}
 */
DetailsRenderer.CardsDetailsJSON; // eslint-disable-line no-unused-expressions

/**
 * @typedef {{
 *     type: string,
 *     itemType: (string|undefined),
 *     text: (string|undefined)
 * }}
 */
DetailsRenderer.TableHeaderJSON; // eslint-disable-line no-unused-expressions

/** @typedef {{
 *     type: string,
 *     header: ({text: string}|undefined),
 *     items: !Array<!Array<!DetailsRenderer.DetailsJSON>>,
 *     itemHeaders: !Array<!DetailsRenderer.TableHeaderJSON>
 * }}
 */
DetailsRenderer.TableDetailsJSON; // eslint-disable-line no-unused-expressions


/** @typedef {{
 *     type: string,
 *     url: ({text: string}|undefined),
 *     mimeType: ({text: string}|undefined)
 * }}
 */
DetailsRenderer.ThumbnailDetails; // eslint-disable-line no-unused-expressions
