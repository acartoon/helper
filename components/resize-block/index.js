
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
