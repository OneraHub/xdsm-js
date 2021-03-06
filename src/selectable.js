import { select, selectAll } from 'd3-selection';

function Selectable(xdsm, callback) {
  this._xdsm = xdsm;
  this._selection = null;
  this._prevSelection = null;
  this._callback = callback;

  this.enable();
}

Selectable.prototype.enable = function enable() {
  this._addEventHandler('.node');
  this._addEventHandler('.edge');
};

Selectable.prototype._addEventHandler = function _addEventHandler(klass) {
  const self = this;
  selectAll(klass).on('click', function makeSelection() {
    const prevSelection = select('[data-xdsm-selected="true"]');
    self._unselect(prevSelection);

    const selection = select(this); // eslint-disable-line no-invalid-this
    if (prevSelection.empty()
      || prevSelection.data()[0].id !== selection.data()[0].id) {
      self._select(selection);
    }
    self._callback(self.getFilter());
  });
};

Selectable.prototype._select = function _select(selection) {
  selection.attr('data-xdsm-selected', true);
  selection.select('.shape')
    .transition().duration(100).style('stroke-width', '4px');
};

Selectable.prototype._unselect = function _unselect(selection) {
  selection.attr('data-xdsm-selected', null);
  selection.select('.shape')
    .transition().duration(100).style('stroke-width', null);
};

Selectable.prototype.getFilter = function getFilter() {
  const filter = {
    fr: undefined,
    to: undefined,
  };
  const selection = select('[data-xdsm-selected="true"]');
  if (!selection.empty()) {
    const selected = selection.data()[0];
    if (selected.iotype) { // edge
      filter.fr = this._xdsm.graph.getNodeFromIndex(selected.row).id;
      filter.to = this._xdsm.graph.getNodeFromIndex(selected.col).id;
    } else { // node
      filter.fr = selected.id;
      filter.to = selected.id;
    }
  }
  return filter;
};

Selectable.prototype.setFilter = function setFilter(filter) {
  const self = this;
  const prevSelection = select('[data-xdsm-selected="true"]');
  let selection;
  if (filter.fr === filter.to) {
    if (filter.fr !== undefined) {
      selection = select(`.id${filter.fr}`);
      self._select(selection);
    }
  } else if (filter.fr !== undefined && filter.to !== undefined) {
    selection = select(`.idlink_${filter.fr}_${filter.to}`);
    self._select(selection);
  }
  if (!selection || selection.empty()
    || (!prevSelection.empty() && prevSelection.data()[0].id !== selection.data()[0].id)) {
    self._unselect(prevSelection);
  }
};

export default Selectable;
