function CounterFilter() {
    this.counters = {};
    this.counterMain = 0;
    this.activeClass = 'show';
    this.selectedClass = 'selected';

    this.init();
}

CounterFilter.prototype.changeCheckedFilter = function(evt) {
    var target = $(evt.target);

    var isChecked = target.is(":checked");
    var name = target.attr('name');

    if(typeof this.counters[name] !== "undefined") {
        this.counters[name] =  isChecked ?  ++this.counters[name] : --this.counters[name];
    } else {
        this.counters[name] = 1;
    }

    this.counterMain = isChecked ?  ++this.counterMain : --this.counterMain;

    this.updateCounter(name);
};

CounterFilter.prototype.updateCounter = function(name) {

    $('.js-full-counter').text(this.counterMain);

    var parent = $('[data-dropdown-type="' + name +'"]')
    parent.find('.js-counter-val').text(this.counters[name]);

    if(this.counters[name] > 0) {
        parent.addClass(this.selectedClass);
    } else {
        parent.removeClass(this.selectedClass);
    }
}


CounterFilter.prototype.clearCounter = function(parent) {
    var currentCounter = parent.find('.js-counter:checked');
    var name = currentCounter.eq(0).attr('name');
    this.counters[name] = 0;
    this.counterMain = this.counterMain - currentCounter.length;

    currentCounter.each(function () {
        $(this).prop('checked', false);
    })

    this.updateCounter(name);
}

CounterFilter.prototype.watchers = function() {
    var changeCheckedFilter = $.proxy(this.changeCheckedFilter, this)
    var clearCounter = $.proxy(this.clearCounter, this)

    $('body').on('change', '.js-counter', changeCheckedFilter);


    $('body').on('click','.js-clear-counter', function () {
        var parent = $(this).closest('.dropdown');
        clearCounter(parent);
    });
}

CounterFilter.prototype.init = function() {
    this.watchers();
}
