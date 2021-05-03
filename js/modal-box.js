function modalBox(params) {
    var modal = {
        _openClass: 'modal--open',
        _openContainerClass: 'ready',
        _modal: $('#' + params.id),
        _overlay: $('.modal-overlay'),
        _btnClose: false,

        _open: function () {
            this._modal.addClass(this._openClass);
            this._overlay.addClass(this._openContainerClass);
            var margin = getScrollbarSize();
            $('html').css({
                'oveflow': 'hidden',
                'marginRight': margin,
            });

        },

        _close: function () {
            if(params.cb.beforeClose) {
                params.cb.beforeClose();
            }
            this._modal.removeClass(this._openClass);
            this._overlay.removeClass(this._openContainerClass);
            $('html').prop('style', false);
            if(params.cb.afterClose) {
                params.cb.afterClose();
            }
        },

        _init: function () {
            this._btnClose = this._modal.find('.js-close');
            this._btnClose.on('click', this._close);
            this._overlay.on('click', this._close);
        },

        init: function () {
            if(params.cb.beforeInit) {
                params.cb.beforeInit();
            }
            this._init();
            this._open();
            if(params.cb.afterInit) {
                params.cb.afterInit();
            }
        }
    }
    return modal;
}

