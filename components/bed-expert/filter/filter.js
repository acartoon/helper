function debounce(func, wait, immediate) {
    var timeout;
    return function executedFunction() {
        var context = this;
        var args = arguments;

        var later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };

        var callNow = immediate && !timeout;

        clearTimeout(timeout);

        timeout = setTimeout(later, wait);

        if (callNow) func.apply(context, args);
    };
};

jQuery.fn._toggle = function() {
    var st = this.css('visibility');
    var st2 = this.css('display');
    var target = this;
    if(st == 'hidden' || st2 == 'none') {
        this.css({
            'position': 'static',
            'zIndex': '0',
            'display': 'block',
            'visibility': 'visible',
        });
        var height = this.innerHeight();

        this.height(0);
        this.animate({
            height: height,
        }, 400, function () {
            target.css({
                'height': '',
                'visibility': '',
                'zIndex': '',
                'display': '',
            })
        })
    } else {
        this.css({
            'visibility': 'visible',
            'overflow': 'hidden',
            'display': 'block',
            'position': 'static',
            'zIndex': '0',
            'height': '',
        })
        this.animate({
            height: 0,
        }, 400, function () {
            target.css({
                'height': '',
                'position': 'absolute',
                'zIndex': -1,
                'display': '',
                'width': 'auto',
                'visibility': 'hidden',
                'overflow': ''
            })

        })

    }
}

function accordionToggle(target, cb) {
    var parentClass = '.js-accordion';
    var parent = target.closest(parentClass);
    var disabledClass = 'disabled';
    var activeClass = 'active';

    if(target.hasClass(disabledClass)) return;

    parent.find('.js-accordion-body')._toggle();
    parent.toggleClass(activeClass);

    cb(parent)
}

function getHeightBlock(spoilerBody) {
    var SHOW_COUNT = 5;
    var heightBlock = 0;
    var children = spoilerBody.children().children(':not(.hidden)');

    for(var i = 0; i < SHOW_COUNT; i++) {
        heightBlock += $(children[i]).outerHeight(true);
    }

    return heightBlock;
}

function spoiler(parent) {
    var SHOW_COUNT = 5;
    var spoilerBody = parent.find('.spoiler__body');

    var button = parent.find('.spoiler__active-text')
    spoilerBody.css('overflow', 'hidden');
    var heightBlock = 0;

    var children = spoilerBody.children().children(':not(.hidden)');

    if(children.length <= SHOW_COUNT) {
        parent.addClass('disable');
        return;
    } else {
        parent.removeClass('disable');
    }

    for(var i = 0; i < SHOW_COUNT; i++) {
        heightBlock += $(children[i]).outerHeight(true);
    }

    spoilerBody.css('maxHeight', heightBlock);
    spoilerBody.css('maxHeight', heightBlock);
    button.text('Показать еще ' + (children.length - SHOW_COUNT));
}

$('.spoiler').each(function () {
    spoiler($(this))
});


function initScrollbar(block, container) {
    block.scrollbar({
        'onInit': function () {

        },
        'autoUpdate': true,
        'onDestroy': function () {
            //localStorage.removeItem(container.attr('data-id') + '_scrollbar');
            block.scrollTop(0)
        },
        'onScroll': function (evt) {
            localStorage.setItem(container.attr('data-name') + '_scrollbar', evt.scroll);
        }
    });

}

function search() {
    var _this = $(this);
    var searchData = _this.val().trim().toLowerCase();
    var name = _this.closest('.fiter-part').attr('data-name');
    renderSearchResult(searchData, _this, name)
}

function renderSearchResult(searchData, target, name) {
    var spoilerBlock = target.closest('.spoiler');

    var checklist = spoilerBlock.find('.check-list').children();
    localStorage.setItem(name + '_search', searchData);

    checklist.each(function () {
        var title = $(this).find('.check-block__label').attr('title');

        var isIncludes = title.toLowerCase().includes(searchData);

        if(!isIncludes) {
            $(this).addClass('hidden');
        } else {
            $(this).removeClass('hidden');
        }
    })

    if(searchData.length == 0) {
        spoilerBlock.removeClass('search');
        checklist.each(function () {
            $(this).removeClass('hidden');
        })
    } else {
        spoilerBlock.addClass('search');
    }

    spoiler(spoilerBlock);
}

function refreshSearch() {
    var search = $('.js-search')
    search.each(function () {
        var _this = $(this);
        var name = _this.closest('.fiter-part').attr('data-name');

        var searchData = localStorage[name + '_search'];
        _this.val(searchData)
        if(searchData != "undefined" && searchData) {
            renderSearchResult(searchData, _this, name)
        }
    })
}

function refreshAccordionFilter() {

    $('.js-accordion').each(function () {
        var id = $(this).attr('data-name');
        var spoiler = $(this).find('.spoiler');
        var state_accordion = localStorage[id + '_accordion']
        var state_scrollbar = localStorage[id + '_scrollbar']

        if(state_accordion == 'active') {
            $(this).addClass('active');
        } else if(state_accordion == 'closed') {
            $(this).removeClass('active');
        }
        if(state_scrollbar) {
            var scrollBlock = $(this).find('.spoiler__body');
            scrollBlock.scrollTop(state_scrollbar);
            spoiler.addClass('show');
            initScrollbar(scrollBlock, $(this));
        }
    });
}


function StateFilter() {
    this.counters = {};
    this.counterMain = 0;
    this.selectedClass = 'checked';

    this.init();

}



StateFilter.prototype.getCounter = function (name) {
    var counter = 0;

    var _this = this;
    Object.keys(this.counters).forEach(function (item) {
        if(_this.counters[item] > 0) {
            counter ++;
        }
    });

    return counter;
}

StateFilter.prototype.updateMainCounter = function (name) {
    var showClass = 'show';
    var counter = this.getCounter();
    var counterContainer = $('.js-main-count');
    var resetBtn = $('.js-reset');

    if(counter > 0) {
        resetBtn.addClass(showClass);
        counterContainer.addClass(showClass);
        counterContainer.text(counter);
    }
    else {
        resetBtn.removeClass(showClass);
        counterContainer.removeClass(showClass);
    }
}

StateFilter.prototype.updateCounter = function (name) {

    var parent = $('[data-name="' + name +'"]')

    if(this.counters[name] > 0) {

        parent.addClass(this.selectedClass);
    } else {

        parent.removeClass(this.selectedClass);
    }

}

StateFilter.prototype.changeRange = function (name, value) {
    this.counters[name] = value ?  1 : 0;
    this.updateCounter(name);
    this.updateMainCounter();
}

StateFilter.prototype.changeFilter = function (evt) {
    var target = $(evt.target);

    var isChecked = target.is(":checked");
    var name = target.attr('name');

    if(typeof this.counters[name] !== "undefined") {
        this.counters[name] =  isChecked ?  ++this.counters[name] : --this.counters[name];
    } else {
        this.counters[name] = isChecked ?  1 : 0;
    }

    this.counterMain = isChecked ?  ++this.counterMain : --this.counterMain;

    this.updateCounter(name);
    this.updateMainCounter();
}

StateFilter.prototype.refresh = function () {
    var _this = this;
    this.counters = {}

    $('.js-checked').each(function () {
        var isChecked = $(this).is(":checked");
        if(isChecked) {
            var name = $(this).attr('name');
            _this.counters[name] =  _this.counters[name] ? ++_this.counters[name] : 1;
            _this.updateCounter(name)
        }
    })

    this.updateMainCounter();
}

StateFilter.prototype.init = function () {
    this.refresh();

    var changeFilter = $.proxy(this.changeFilter, this)
    $('body').on('change', '.js-checked', changeFilter)
}

var stateFilter = new StateFilter();

// после выполнения аякса для обновления фильтра выполнить функцию
// refreshFilter() обновит состояния примененного фильтра

function RangeSlider(slider, action='default') {
    this.slider;
    this.sliderWrapper = slider;
    this.sliderContainer = slider.find('.js-range');
    this.inputMin = slider.find('.range__input--min');
    this.inputMax = slider.find('.range__input--max');

    if(action == 'default') {
        this.init();
    } else if (action == 'refresh'){
        this.refresh();
    }
}

RangeSlider.prototype.changeRange = function (val, typeChange) {
    var value = Number(val)
    var from = this.inputMin.attr('data-value-min');
    var to = this.inputMax.attr('data-value-max');
    var input = (typeChange == 'from') ? this.inputMin : this.inputMax;
    var name = input.attr('name');
    //input.val(Number(value).toLocaleString('ru'));

    if (value < from) {
        value = from;
        input.val(Number(from).toLocaleString('ru'));
    } else if (value > to) {
        value = to;
        input.val(Number(to).toLocaleString('ru'));
    }

    if(typeChange == 'from') {
        this.slider.update({
            from: value
        })
    } else {
        this.slider.update({
            to: value
        })

    }

    if(
        (this.slider.old_from != this.slider.options.min) ||
        (this.slider.old_to != this.slider.options.max)
    ){
        stateFilter.changeRange(name, true);
    } else {
        stateFilter.changeRange(name, false);
    }
}

RangeSlider.prototype.watchers = function () {
    var _this = this;

    $('.range__input[type=text]').mask('000 000 000 000', {
        reverse: true,
        onComplete: function (cep) {
            alert('CEP Completed!:' + cep);
        },
    });



    function changeRange(e) {
        //var value = $(e.target).val();
        var value = $(e.target).cleanVal();
        var type = $(e.target).data('type');
        _this.changeRange(value, type);
    }

    this.inputMin.on('input', debounce(changeRange, 700));
    this.inputMax.on('input', debounce(changeRange, 700));

}

RangeSlider.prototype.render = function (params) {
    var _this = this;
    this.sliderContainer.ionRangeSlider({
        skin: "round",
        type: "double",
        grid: false,
        min: params.min.attr('data-value-min'),
        max: params.max.attr('data-value-max'),
        from: params.from,
        to: params.to,
        grid_snap: false,
        hide_min_max: true,
        hide_from_to: true,
        onStart: function (data) {

        },

        onChange: function (data) {
            params.min.val(data.from.toLocaleString('ru'));
            params.max.val(data.to.toLocaleString('ru'));
        },

        onFinish: function (data) {
            var name = params.max.attr('name');

            //обсновление состояния фильтра
            if(data.from_percent > 0 || (data.to_percent > 0 && data.to_percent < 100)) {
                stateFilter.changeRange(name, true);
            } else {
                stateFilter.changeRange(name, false);
            }
            //добавление параментов фильтра в локальное хранилище
            localStorage.setItem(name + '_from_range', data.from);
            localStorage.setItem(name + '_to_range', data.to);
        },
        onUpdate: function (data) {

        }
    });

    this.slider = this.sliderContainer.data("ionRangeSlider")

}

RangeSlider.prototype.init = function () {
    var _this = this;

    this.render({
        min: this.inputMin,
        max: this.inputMax,
        from: this.inputMin.attr('data-value-min'),
        to: this.inputMax.attr('data-value-max'),
    });
    this.watchers();
}

RangeSlider.prototype.refresh = function() {
    var minRange = this.sliderWrapper.find('.range__input--min');
    var maxRange = this.sliderWrapper.find('.range__input--max');
    var name = minRange.attr('name');

    if(
        (parseInt(minRange.val()) != localStorage[name + '_from_range']) ||
        (parseInt(maxRange.val()) != localStorage[name + '_to_range'])
    ) {
        stateFilter.changeRange(name, true)
    }
    minRange.val(parseInt(localStorage[name + '_from_range']).toLocaleString('ru'));
    maxRange.val(parseInt(localStorage[name + '_to_range']).toLocaleString('ru'));

    this.render({
        min: minRange,
        max: maxRange,
        from: localStorage[name + '_from_range'],
        to: localStorage[name + '_to_range'],
    });
}



function Dropdown(dropdown) {
    this.dropdown = dropdown;
    this.toggle = dropdown.find('.dropdown__selection');
    this.list = dropdown.find('.dropdown__dropdown');
    this.scrollBlock = dropdown.find('.dropdown__in');
    this.item = dropdown.find('.dropdown-list__item input');
    this.activeClass = 'open';
    this._onBodyClick = $.proxy(this.onBodyClick, this);
    this.init();
}

Dropdown.prototype.isOpen = function() {
    return this.dropdown.hasClass(this.activeClass);
}

Dropdown.prototype.open = function() {
    this.dropdown.addClass(this.activeClass);
    $('body').on('click', this._onBodyClick);

    this.scrollBlock.scrollbar();
}

Dropdown.prototype.close = function() {
    this.dropdown.removeClass(this.activeClass);

    $('body').off('click', this._onBodyClick);
}

Dropdown.prototype.onBodyClick = function(evt) {
    var target = $(evt.target);

    if(!target.closest('.dropdown').length) {
        this.close();
    }
}

Dropdown.prototype.watchers = function() {
    var _this = this;

    this.toggle.on('click', function() {
        if(_this.isOpen()) {
            _this.close();
        } else {
            _this.open();
        }
    })

    this.item.on('change', function() {
        var value = $(this).val();
        var name = $(this).attr('name')
        localStorage.setItem(name + '_select', value);

    })
}

Dropdown.prototype.init = function() {
    this.watchers();
}


refreshStateDropdown = function () {
    //this.watchers();
    var dropdownList = $('[data-name][data-target="dropdown"]');

    dropdownList.each(function () {
        var name = $(this).attr('data-name');
        var dropdown  = new Dropdown($(this));

        var selectedVal = localStorage[name + '_select'];
        $(this).find('.dropdown__renderer').text(selectedVal);
    })
}

function refreshFilter() {
    // обновяляю счетчик слайдера
    stateFilter.refresh();

    // обновляю range slider
    var priceRangeSlider = new RangeSlider($('.js-price'), 'refresh');
    var loadRangeSlider = new RangeSlider($('.js-load'), 'refresh');

    // обновяляю раскрытие и закрытые блоки
    refreshAccordionFilter()

    //примененный поиск еще
    refreshSearch();
    //select
    refreshStateDropdown();
}

var drop = $('[data-target="dropdown"]');
drop.each(function () {
    var dropdown  = new Dropdown($(this));
});


var priceRangeSlider = new RangeSlider($('.js-price'));
var loadRangeSlider = new RangeSlider($('.js-load'));


$('body').on('click', '.js-accordion-head', function (evt) {
    console.log($(evt.target).closest('.fiter-part__modal'))
    if($(evt.target).closest('.fiter-part__modal').length) return;
    accordionToggle($(this), cb);


    function cb(parent) {
        var idFilter = parent.attr('data-name');
        if(parent.hasClass('active')) {
            localStorage.setItem(idFilter + '_accordion', 'active');
        } else {
            localStorage.setItem(idFilter + '_accordion', 'closed');
        }
    }

});

$('body').on('input', '.js-search', debounce(search, 500));

$('body').on('click', '.js-spoiler-more', function () {
    var MAX_HEIGHT = '300px';
    var parent = $(this).closest('.spoiler');
    var spoilerBody = parent.find('.spoiler__body');
    var fiterPart = $(this).closest('.fiter-part');
    console.log(fiterPart)


    if(parent.hasClass('show')) {
        parent.removeClass('show');
        spoilerBody.css('overflow', 'hidden');
        spoilerBody.scrollbar('destroy');
        var spoilerBody = parent.find('.spoiler__body');
        var heightBlock = getHeightBlock(spoilerBody);

        spoilerBody.animate({
            'max-height': heightBlock,
        })

    } else {
        parent.addClass('show');
        spoilerBody.animate({
            'max-height': MAX_HEIGHT,
        }, function () {
            spoilerBody.scrollbar({
                'onInit': function () {

                },
                'autoUpdate': true,
                'onDestroy': function () {
                    localStorage.removeItem(fiterPart.attr('data-name') + '_scrollbar');
                    spoilerBody.scrollTop(0)
                },
                'onScroll': function (evt) {
                    localStorage.setItem(fiterPart.attr('data-name') + '_scrollbar', evt.scroll);
                }
            });
            spoilerBody.css('overflowY', 'auto');
        })
    }
})

$('.js-scroll-body').scroll(function(event) {
    var st = $(this).scrollTop();
    if(st !== 0) {
        $('.sticky-header').addClass('sticky')
    } else {
        $('.sticky-header').removeClass('sticky')
    }
})


$('body').on('click', '[data-target="close"]', function(event) {
    var modalId = $(this).data('modalId');
    var modal = $('[data-id="'+ modalId + '"]');

    modal.removeClass('open');
    $('body').removeClass('no-modal-scroll');
    //modal.scrollTop(0);
})


// $('body').on('click', '.js-open-filter', function(event) {
//     $('.js-modal-filter').addClass('open');
//     $('body').css('overflow', 'hidden');
// })


$('body').on('click', '[data-target="open-modal"]', function(event) {
    var modalId = $(this).data('modalId');
    var modal = $('[data-id="'+ modalId + '"]');

    if(modal.hasClass('open')) {
        modal.removeClass('open');
        $('body').removeClass('no-modal-scroll');
    } else {
        modal.addClass('open');
        $('body').addClass('no-modal-scroll');
    }
})

function VisibleTags(tagList) {
    this.tagList = tagList;
    this.count = tagList.find('.product-tags__item.js-more');
    this.widthContainer = tagList.width() - this.count.outerWidth(true) - 50;
    this.hidenItems = [];
    this.items = this.getItems();
    this.itemsCount = this.items.length;
    this.widthItems = this.getWidthItems();
    this.init();
}

VisibleTags.prototype.getWidthItems = function() {
    var widthItems = 0;
    this.items.each(function () {
        widthItems += $(this).outerWidth(true);
    })
    return widthItems;
}

VisibleTags.prototype.getItems = function () {
    return this.tagList.find('.product-tags__item:not(.js-more):not(.hide)')
}

VisibleTags.prototype.init = function() {
    var _this = this;
    if(!this.items.length) return;
    if(this.widthContainer < this.widthItems) {
        this.hideItems();
    }
    $(window).resize(function() {
        _this.initResize();
    })
}

VisibleTags.prototype.hideItems = function() {
    this.items = this.getItems();
    var lastItem = this.items.eq(this.itemsCount - 1);
    this.hidenItems.push(lastItem);
    lastItem.addClass('hide'); // находит последнего и скрываем его
    this.itemsCount = this.itemsCount - 1;
    this.items = this.getItems();
    this.widthItems = this.getWidthItems();

    if(this.widthContainer < this.widthItems) {
        this.hideItems();
    } else {
        this.count.removeClass('hide');
        this.count.find('.product-tags__link').text('показать ещё ' + this.hidenItems.length);
    }
}

VisibleTags.prototype.showItems = function () {
    this.hidenItems[this.hidenItems.length - 1].removeClass('hide');
    this.hidenItems.splice(this.hidenItems.length - 1, 1);

    //обновила массив и общую длинну тегов после ракировки
    this.itemsCount += 1;
    this.items = this.getItems();
    this.widthItems = this.getWidthItems();

    this.count.find('.product-tags__link').text('показать ещё ' + this.hidenItems.length);

    // если нет скрытых элементов, убираю блок со счетчиком
    if(this.hidenItems.length == 0) {
        this.count.addClass('hide');
    }
    this.showTags();
}

VisibleTags.prototype.initResize = function () {
    this.widthContainer = this.tagList.width() - this.count.outerWidth(true);
    this.widthItems = this.getWidthItems();
    // длина ближайшего к показу тега
    this.showTags();

    if(this.widthContainer < this.widthItems) {
        this.hideItems();
    }
}

VisibleTags.prototype.showTags = function () {
    this.widthItem = this.hidenItems[this.hidenItems.length - 1].outerWidth(true);
    if(this.widthContainer > this.widthItems + this.widthItem) {
        this.showItems();
    }
}

var test = new VisibleTags($('.js-tags'))


$('.filter-input__in').focus(function () {
    ($(this)).parent().addClass('focus');

})

$('.filter-input__in').focusout(function () {
    ($(this)).parent().removeClass('focus');
})

