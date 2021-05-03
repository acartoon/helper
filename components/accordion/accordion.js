function accordionToggle(target, type = 'default') {
    var parentClass = '.accordion';
    var parent = target.closest(parentClass);
    var group = parent.attr('data-accordion-group');
    var disabledClass = 'disabled';
    var activeClass = 'active';

    if(target.hasClass(disabledClass)) return;

    switch (type) {
        case 'toggle':
            if(parent.hasClass(activeClass)) return;
            var other = $('.accordion.active[data-accordion-group=' + group + ']');
            other.find('.accordion__body')._toggle();
            other.removeClass(activeClass);

            parent.find('.accordion__body')._toggle();
            parent.addClass(activeClass);
            break;
        case 'default':
            parent.find('.accordion__body')._toggle();
            parent.toggleClass(activeClass);
            break;
    }
}

$('body').on('click', '[data-target="accordion"]', function () {
    var type = $(this).attr('data-accordion-type');
    accordionToggle($(this), type);
})
