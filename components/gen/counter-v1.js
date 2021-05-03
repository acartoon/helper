var activeFilterAttr = 'data-count-selected';
var fullCounter = $('.js-full-counter');

/**
 * очищает счетчик у элемента фильтра
 * */
function clearFilter(parent) {
    var currentCounter = parent.find('.js-counter:checked');
    var name = currentCounter.eq(0).attr('name');
    refreshCounter(name, 0);
    updateFullCounter(-currentCounter.length);

    currentCounter.each(function () {
        $(this).prop('checked', false);
    })
}

/**
 * обновляет счетчик всех фильтров
 * */
function updateFullCounter(count) {
    var counter = fullCounter.attr(activeFilterAttr)  ?
        parseFloat(fullCounter.attr(activeFilterAttr)) : 0;

    counter += count;
    fullCounter.attr(activeFilterAttr, counter);
    fullCounter.text(counter);
}

function refreshCounter(name, counter) {
    var dropdown = $('[data-dropdown-type=' + name +']');
    var counterWrapper = dropdown.find('.dropdown__counter');
    dropdown.attr(activeFilterAttr, counter);
    counterWrapper.text(counter);

    if(counter <= 0) {
        dropdown.removeClass('selected');
    } else {
        dropdown.addClass('selected');
    }

}

function onFilterClick(target) {
    var isChecked = target.is(":checked");
    var name = target.attr('name');
    var counter = $('[data-dropdown-type=' + name +']').attr(activeFilterAttr);
    counter = counter ? parseFloat(counter) : 0;
    counter = isChecked ?  ++counter : --counter ;

    refreshCounter(name, counter);
    updateFullCounter(isChecked ? +1 : - 1);
}

// $('body').on('change', '.js-counter', function () {
//     onFilterClick($(this))
// });
//
// $('body').on('click','.js-clear-counter', function () {
//     var parent = $(this).closest('.dropdown');
//     clearFilter(parent);
// });

