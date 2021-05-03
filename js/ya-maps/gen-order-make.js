var yaMap = false;

$('body').on('click', '.js-data-count', function () {
    var modal = $('[modal-name="filter"]');
    onCloseModal(modal);
})

// промокоды

$('body').on('input', '.promo-code__input-block .input-block__input', function () {
    togglePromocodeAvailable($(this));
});

function togglePromocodeAvailable(inputPromocode) {
    var inputPromocode = $('.promo-code__input-block .input-block__input');
    var buttonPromocode = $('.promo-code__button--apply');


    if(inputPromocode.length & buttonPromocode.length) {
        var promocode = inputPromocode.val();
        if(promocode !== '') {
            buttonPromocode.prop('disabled', false);
        } else {
            buttonPromocode.prop('disabled', true);
        }

    }
}

function changeDeliveryName(name) {
    $('.order-make__selected-delivery').text(name);
}

togglePromocodeAvailable();

// проверяет заполнены ли все поля адреса доставки
/*
* проверяет заполненность обязательных полей и возвращет true или false
* вызывать на кнопке button[data-action="chooseDeliveryCourier"]
* */
function checkFullAddressPickup() {
    var inputs = $('.js-select-address-pickup .input-block__input[required]');
    var isFull = true;
    inputs.each(function () {
        isFull = isFull && $(this).val() != '';
    });
    return isFull;
}

// меняет класс у кнопки
function toggleAvailabilityButton() {
    if(checkFullAddressPickup()) {
        $('.choose-delivery .button').removeClass('button--disabled');
        $('.choose-delivery .button').prop('disabled', false);
    } else {
        $('.choose-delivery .button').addClass('button--disabled');
        $('.choose-delivery .button').prop('disabled', true);
    }
}

// при загрузке проверяет заполнены ли поля
toggleAvailabilityButton();

// проверка кнопки при изменении полей
$('body').on('input', '.js-select-address-pickup .input-block__input[required]', function () {
    toggleAvailabilityButton();
});


var pvzType = {
    SDEK: 'sdek',
    BB: 'boxberry'
};

var pvzName = {
    SDEK: 'ПВЗ СДЭК',
    BB: 'ПВЗ Boxberry'
}

var pvzName2 = {
    SDEK: 'СДЭК',
    BB: 'Boxberry'
}

var $pvzBBListGlobal = [];
var $pvzSdekListGlobal = [];

var keysDataForModalBB = {
    price: 'Стоимость',
    deliveryPeriod: 'Срок доставки',
    shortAddress: 'Адрес',
    workSchedule: 'Режим работы',
    phone: 'Контактный телефон',
    variantPay: 'Способ оплаты',
    tripDescription: 'Как добраться'
};

var keysDataForModalSDEK = {
    price: 'Стоимость',
    period: 'Срок доставки',
    Address: 'Адрес',
    WorkTime: 'Режим работы',
    Phone: 'Контактный телефон',
    Note: 'Как добраться'
};

var templateModal = $('<div class="block-info block-wrapper">\n' +
    '                      <div class="block-info__head">\n' +
    '                        <p class="block-info__title"></p>\n' +
    '                      </div>\n' +
    '                      <p class="block-info__text"></p>\n' +
    '                    </div>');

var templatePvzItem = $('<li class="delivery-point__item" modal-open="detail" modal-replay="true">\n' +
    '                    <p class="delivery-point__title"><span class="delivery-point__name">ПВЗ Boxberry</span><span class="delivery-point__price">380 ₽</span></p>\n' +
    '                    <p class="delivery-point__address">1-я Майская ул, д.10</p>\n' +
    '                    <p class="info">Дата доставки — четверг, 24 сентября</p>\n' +
    '                </li>');


// отрисовка детальной ПВЗ
function onClickPvz($pvzList, pvz, type) {

    var modal = $('[modal-name="detail"]');
    var container = modal.find('.modal__inner');
    var btn = modal.find('.button');
    container.empty();

    switch (type) {
        case pvzType.SDEK:
            var period = $('[data-code="sdek:pickup"]').attr('data-period');
            var price = $('[data-code="sdek:pickup"]').attr('data-price');
            // price = (price == 0) ? 'Бесплатно' :  price + ' ₽';

            var titleText = pvzName.SDEK;
            var keys = keysDataForModalSDEK;
            $pvzList[pvz]['period'] = period;
            btn.attr('data-pvz-name', $pvzList[pvz].Address + ' #S' + pvz);
            btn.attr('data-address-pickup', $pvzList[pvz].Address);
            break;
        case pvzType.BB:
            var price = $('[data-code="boxberry:PVZ"]').attr('data-price');
            // price = (price == 0) ? 'Бесплатно' :  price + ' ₽';
            var titleText =  pvzName.BB;
            var period = $pvzList[pvz].deliveryPeriod = $pvzList[pvz].deliveryPeriod.replace('Срок доставки: ', '');
            var keys = keysDataForModalBB;
            btn.attr('data-pvz-name', $pvzList[pvz].pvzName);
            btn.attr('data-address-pickup', $pvzList[pvz].shortAddress);
            btn.attr('data-pvz', $pvzList[pvz].pvzId);
            break;
    }

    var title = $('<h4 class="order-make__modal-wrapper modal__h4">' + titleText + '</h4>');
    container.append(title);

    Object.keys(keys).forEach(function(item) {
        var newTemplateModal = templateModal.clone();
        newTemplateModal.find('.block-info__title').text(keys[item] + ':');
        newTemplateModal.find('.block-info__text').text($pvzList[pvz][item])
        container.append(newTemplateModal);
        if(item == 'period' || item == 'deliveryPeriod') {
            newTemplateModal.find('.block-info__text').html(period + ' ' +'<span class="caption">(Предположительно)</span>');
        }
        if(item == 'price') {
            if(price == 0) {
                newTemplateModal.find('.block-info__text').text('Бесплатно');
                newTemplateModal.find('.block-info__text').addClass('text-green bold');
            } else {
                newTemplateModal.find('.block-info__text').text(price + ' ₽');
                newTemplateModal.find('.block-info__text').removeClass('text-green bold');
            }
        }
    });
};

//обработчик для детальной пункта ВВ
$(document).on('click', '[data-delivery-boxberry-pvz]', function () {
    var attr = $(this).attr('data-delivery-boxberry-pvz');
    onClickPvz($pvzBBListGlobal, attr, pvzType.BB);
});

//обработчик для детальной пункта СДЭК
$(document).on('click', '[data-delivery-sdek-pvz]', function () {
    var attr = $(this).attr('data-delivery-sdek-pvz');
    onClickPvz($pvzSdekListGlobal, attr, pvzType.SDEK);
});


// создаю отдельный ПВЗ блок в списке ПВЗ
function createPvzBlock(typePvz, data, i, period, price, numberPlacemark) {
    var pvz = templatePvzItem.clone();

    switch (typePvz) {
        case pvzType.SDEK:
            var name = pvzName.SDEK;
            var address = data.Address;
            var attr = 'data-delivery-sdek-pvz';
            break;
        case pvzType.BB:
            var name = pvzName.BB;
            var address = data.shortAddress;
            var attr = 'data-delivery-boxberry-pvz';
            var period = data.deliveryPeriod.replace('Срок доставки: ', '');
            break;
    }

    pvz.find('.delivery-point__name').text(name);

    if(price == 0) {
        pvz.find('.delivery-point__price').text('Бесплатно');
        pvz.find('.delivery-point__price').addClass('text-green');
    } else {
        pvz.find('.delivery-point__price').text(price + ' ₽');
        pvz.find('.delivery-point__price').removeClass('text-green');
    }

    pvz.find('.delivery-point__address').text(address);
    pvz.find('.info').text('Срок доставки - ' + period);
    pvz.attr(attr, i);
    pvz.attr('data-placemark', numberPlacemark)

    return pvz;
};

// отрисовка списка ПВЗ
function renderBBPvzList($pvzList) {
    var period = $('[data-code="boxberry:PVZ"]').attr('data-period');
    var price = $('[data-code="boxberry:PVZ"]').attr('data-price');

    var container = $('.choose-pickup__delivery-point');
    container.empty();

    $pvzList.forEach(function (item, i) {
        var pvzItem = createPvzBlock(pvzType.BB, item, i, period, price, i);
        container.append(pvzItem);
    });
}

// рендер списка ПВЗ
function renderSdekPvzList(pvzList) {
    var period = $('[data-code="sdek:pickup"]').attr('data-period');
    var price = $('[data-code="sdek:pickup"]').attr('data-price');

    var container = $('.choose-pickup__delivery-point');
    container.empty();

    Object.keys(pvzList).forEach(function (item, i) {
        pvzList[item];
        var pvzItem = createPvzBlock(pvzType.SDEK, pvzList[item], item, period, price, i);
        container.append(pvzItem);
    })
}

$('body').on('click', '.order_action', function (evt) {
    evt.preventDefault();
    var $this = $(this);
    var $itemId = $this.attr('data-id');
    var $action = $this.attr('data-action');

    if ($action !== 'applyCoupon') {
        initOrderPreloader();
    }

    if ($action === 'changeLocation') {
        var $locationField = $('#location-field'),
            $setValue = $this.attr('data-id');

        $locationField.val($setValue);
        onCloseAllModal();
    }

    if ($action === 'chooseDeliveryCourier') {
        var $courier = $('[name="tmpDeliveryCourier"]'),
            $selectedCourier = 1,
            $street = $('#ID_STREET').val(),
            $house = $('#ID_HOUSE').val(),
            $flat = $('#ID_FLAT').val(),
            $address = '';

        $address = 'ул. ' + $street + ', ' + $house;
        if ($flat.length > 0) {
            $address += ', кв.' + $flat;
        }

        $courier.each(function () {
            if($(this).prop("checked")) {
                $selectedCourier = $(this).val();
            }
        });

        $('#deliveryIdField').val($selectedCourier);
        $('#addressField').val($address)
        onCloseAllModal();
    }

    if ($action === 'chooseDeliveryPickup') {
        var $pickup = $('[name="tmpDeliveryPvz"]'),
            $selectedPickup = 1;

        $pickup.each(function () {
            if($(this).prop("checked")) {
                $selectedPickup = $(this).attr('data-id');
            }
        });
        var pvzName = $this.attr('data-pvz-name');
        var pvzShortAddress = $this.attr('data-address-pickup');
        var pvz = $this.attr('data-pvz');

        if (pvz && (pvz.length > 0)) {
            $('#selectedBBPvz').val(pvz);
        }

        $('#addressField').val(pvzName);
        $('#addressPvz').val(pvzShortAddress);
        $('#deliveryIdField').val($selectedPickup);
        onCloseAllModal();
        closeMap();
    }

    if ($action === 'createOrder') {
        var $fioField = $('#fioField'),
            $name = $('#ID_NAME').val(),
            $secondName = $('#ID_SECOND_NAME').val(),
            $lastName = $('#ID_LAST_NAME').val(),
            $fio = '';

        $fio = $lastName + ' ' + $name + ' ' + $secondName;
        $fioField.val($fio);
    }

    refreshOrder($action);
});

function refreshOrder($action='') {

    var $data = $('#order_form').serializeArray();
    $data.push({
        "name": "action",
        "value": $action
    });

    if ($action === 'applyCoupon') {
        var $promo = $('.promo-code');
        $promo.addClass('promo-code--wait');
        $promo.find('.input-block').addClass('input-block--dis');
    }

    $.ajax({
        url: "/ajax/order.php",
        type: 'POST',
        async: true,
        data: $data,
        error: function () {
        },
        success: function (response) {
            try {
                var result = JSON.parse(response);
                if (result.SUCCESS_URL) {
                    ingEvents.dataLayerPush('dataLayer', {'event': 'order'});
                    window.location.href = result.SUCCESS_URL;
                }
            } catch (e) {
                $(".order-make").html(response);
                unInitOrderPreloader();
                if (($action === 'chooseDeliveryPickup') || ($action === 'chooseDeliveryCourier')) {
                    orderCreateSteps(orderMakeStepMap.BUYER);
                }

                if ($action === 'choosePayment') {
                    orderCreateSteps();
                }
            }
        }
    });
}

$('body').on('click', '[name="tmpDeliveryCourier"]', function () {
    var $this = $(this),
        $period = $this.attr('data-period'),
        $periodBox = $('#periodDeliveryCourier');

    $periodBox.text($period);
});

$('body').on('click', '[name="tmpDeliveryPvz"]', function () {
    refreshPvzList();
});

window.locationUpdated = function(id) {
    var $locationField = $('#location-field'),
        $location = this.getNodeByLocationId(id),
        $setValue = $location.CODE;

    if ($setValue.length < 1) {
        return ;
    }

    $locationField.val($setValue);
    initOrderPreloader();
    onCloseAllModal();
    refreshOrder('changeLocation');
}

$('body').on('click', '[modal-delivery]', function (evt) {
    evt.preventDefault();

    var $modalType = $(this).attr('modal-delivery');
    var isModalWrapper = $(this).attr('modal-wrapper');

    var $modal = $(`[modal-name=${$modalType}]`);

    if($modal.length) {
        var isReplay = $(this).attr('modal-replay');

        if ($modalType === 'delivery') {
            onOpenModal($modal, isReplay, isModalWrapper, $modalType);
            return;
        }

        refreshPvzList($modal, isReplay, isModalWrapper, $modalType, true);

    } else {
        console.error('отсуствует модальное окно ' + $modalType);
    }
})

function refreshPvzList($modal, isReplay, isModalWrapper, $modalType) {
    var $pickups = $('[name="tmpDeliveryPvz"]'),
        $pickup = false;

    $pickups.each(function () {
        if ($(this).prop('checked')) {
            $pickup = $(this);
        }
    });

    if (!$pickup) {
        return;
    }

    var $pickupPrice = $pickup.attr('data-price');
    var $pickupCode = $pickup.attr('data-code');
    var $pickupLocation = $pickup.attr('data-location');
    var $pickupId = $pickup.attr('data-id');

    if ($pickupCode === 'sdek:pickup') {
        IPOLSDEK_pvz.selectPVZ($pickupId, 'PVZ');
        var $pvzList = IPOLSDEK_pvz.cityPVZ;
        $pvzSdekListGlobal = $pvzList;

        /** вызов функции построения списка ПВЗ */
        renderSdekPvzList($pvzList, $pickupPrice);
        renderMap($pvzList, pvzType.SDEK);

        $('.js-data-count span').text('Показать ' + Object.keys($pvzList).length + ' пункта');
        changeDeliveryName(pvzName2.SDEK)

        if ($modal) {
            onOpenModal($modal, isReplay, isModalWrapper, $modalType);
            openMap();
        }
        return;
    }

    $.ajax({
        url: "/ajax/getPvz.php",
        type: 'POST',
        async: true,
        data: {
            pickupPrice: $pickupPrice,
            pickupCode: $pickupCode,
            pickupLocation: $pickupLocation
        },
        error: function () {
        },
        success: function (response) {
            var result = JSON.parse(response);
            $pvzBBListGlobal = result;

            /** вызов функции построения списка ПВЗ */
            renderBBPvzList(result);
            renderMap(result, pvzType.BB);
            $('.js-data-count span').text('Показать ' + $pvzBBListGlobal.length + ' пункта');
            changeDeliveryName(pvzName2.BB)

            if ($modal) {
                onOpenModal($modal, isReplay, isModalWrapper, $modalType);
                openMap();
            }
        }
    });
}

function toggleBlockChoicePvz(block) {
    block.toggleClass('filter-option--open');
    var modalDropdown = block.find('.modal-dropdown');
    modalDropdown.toggleClass('modal-dropdown--open');
}

$(document).on('click', '.js-choice-pvz', function (evt) {
    var $this = $(this);
    var target = $(evt.target);

    if(target.hasClass('filter-items__label') || target.hasClass('filter-option__title') || target.hasClass('filter-option__title-text')) {
        toggleBlockChoicePvz($this);
        var activePvz = target.text();
        $this.find('.filter-option__title-text').text(activePvz);
    } else {
    }
});

var getPointOptions = function () {
    return {
        preset: 'islands#violetIcon'
    };
};

function openMap() {
    var map = $('#order-make-map');
    map.addClass('order-make__map--open-desktop');
}

function closeMap() {
    var map = $('#order-make-map');
    map.removeClass('order-make__map--open-desktop');
}

function renderMap(point, deliveryType) {
    var activePlacemark = false;

    function toggleActivePlacemark(placemark) {
        if(activePlacemark) {
            activePlacemark.options.set('iconImageHref', '/static/img/icons/aggragation.svg');
        }
        activePlacemark = placemark;
        placemark.options.set('iconImageHref', '/static/img/icons/aggragation-checked.svg');

        yaMap.setCenter(
            activePlacemark.geometry.getCoordinates(),
            15
        );

    }

    var center = [];
    switch (deliveryType) {
        case pvzType.BB:
            center.push(point[0].coordinates.latitude);
            center.push(point[0].coordinates.longitude);
            break;
        case pvzType.SDEK:
            center.push(point[Object.keys(point)[0]].cY);
            center.push(point[Object.keys(point)[0]].cX);
            break;
    }

    ymaps.ready(function () {
        var mapContainer = $('#order-make-map');
        var isRenderedMap = mapContainer.children().length > 0;

        // проверяю отрисована ли карта в dom
        if(!!yaMap & isRenderedMap) {
            clusterer.removeAll();
        } else {
            yaMap = new ymaps.Map('order-make-map', {
                center: center,
                zoom: 9,
            }, {
                searchControlProvider: 'yandex#search'
            })
        }


        MyIconContentLayout = ymaps.templateLayoutFactory.createClass(
            '<div class="pin pin--aggregation" data-aggregation-count="{{ properties.geoObjects.length }}"></div>'
        ),
            MyIconContentLayoutOne = ymaps.templateLayoutFactory.createClass(
                '<div class="pin"></div>'
            ),
            clusterer = new ymaps.Clusterer({
                clusterIconContentLayout: MyIconContentLayout,
                clusterIcons: [
                    {
                        size: [80, 96],
                        offset: [-40, -48]
                    },
                    {
                        size: [80, 96],
                        offset: [-40, -48]
                    }],

                preset: 'islands#invertedVioletClusterIcons',
                groupByCoordinates: false,
                clusterDisableClickZoom: true,
                clusterHideIconOnBalloonOpen: false,
                geoObjectHideIconOnBalloonOpen: false
            });

        getPointOptions = function () {
            return {
                preset: 'islands#violetIcon',
                // iconLayout: MyIconContentLayoutOne,
                iconLayout: 'default#image',
                iconImageHref: '/static/img/icons/aggragation.svg',
                iconImageSize: [73, 80],
                // iconImageOffset: [-5, -38]

            };
        };

        geoObjects = [];
        // создание пина
        function createPlacemark(coord, item) {
            var myPlacemark = new ymaps.Placemark(coord, {}, getPointOptions());
            myPlacemark.events.add('click', function(e) {
                var target = e.get('target');

                toggleActivePlacemark(target)
                onClickPvz(point, item, deliveryType);
                var $modal = $('[modal-name="detail"]');

                // условие открытия
                onOpenModal($modal, true, false, 'detail');
            });

            return myPlacemark;
        }
        $('body').on('click', '[data-placemark]', function () {
            var numberPvz = $(this).attr('data-placemark');

            toggleActivePlacemark(geoObjects[numberPvz]);


        });
        // отрисовываю пины на карте в зависимости от способа доставки
        switch (deliveryType) {
            case pvzType.BB:
                point.forEach(function (item, i) {
                    var myPlacemark = createPlacemark([item.coordinates.latitude, item.coordinates.longitude], i);
                    geoObjects[i] = myPlacemark;
                });
                break;
            case pvzType.SDEK:
                Object.keys(point).forEach(function (item, i) {
                    var myPlacemark = createPlacemark([point[item].cY, point[item].cX], item);
                    geoObjects[i] = myPlacemark;
                })
                break;
        }

        clusterer.options.set({
            gridSize: 80,
            clusterDisableClickZoom: false
        });

        clusterer.add(geoObjects);
        yaMap.geoObjects.add(clusterer);
        yaMap.setBounds(clusterer.getBounds(), {
            checkZoomRange: true
        });
    });
}

function goToPaymentStep() {
    if(isValidBlockBuyer()) {
        orderCreateSteps(orderMakeStepMap.PAYMENT);
    }
}

function orderCreateSteps(step) {
    switch (step) {
        case orderMakeStepMap.BUYER:
            var buyer = $('#buyer .accordion');
            var paymentChecked = $('[data-action="choosePayment"]:checked').length;
            $('body').on('blur', '#buyer .input-block__input', showErrorsPaymentBlock);
            $('body').on('change', '#buyer .input-block-checkbox__input', function () {
                showErrorCheckbox($(this))
            });

            if(paymentChecked) {
                offInputListeners();
                orderCreateSteps();
            } else {
                orderMakeNextStep(buyer);
                // добавление обработчиков для открытия следующего шага
                onInputListeners();
            }
            break;
        case orderMakeStepMap.PAYMENT:
            var payment = $('#payment .accordion');
            var paymentChecked = $('[data-action="choosePayment"]:checked').length;

            if(isValidBlockBuyer() && !paymentChecked) {
                orderMakeNextStep(payment);
                offInputListeners();
            }
            break;
        default:
            var inputTel = $('#buyer [type="tel"]');
            inputTel.unmask();
            inputTel.mask("+7(999)999-99-99", {
                completed: function () {
                    toggleBtnMakeOrder();
                },
            });

            var inputText = $('#buyer .input-block__input')
            inputText.on('blur', toggleBtnMakeOrder);

            inputText.on('input', toggleBtnMakeOrder);

            $('body').on('change', '#buyer .input-block-checkbox__input', toggleBtnMakeOrder);
            inputTel.on('blur', '#buyer [type="tel"]', toggleBtnMakeOrder);
            inputTel.on('input', '#buyer [type="tel"]', toggleBtnMakeOrder);
            toggleBtnMakeOrder();

    }
}

function offInputListeners() {
    var inputTel = $('#buyer [type="tel"]');
    $('body').off('blur', '#buyer .input-block__input', goToPaymentStep);
    $('body').off('change', '#buyer .input-block-checkbox__input', goToPaymentStep);
    inputTel.off('blur', '#buyer [type="tel"]', goToPaymentStep);
    inputTel.unmask();
    inputTel.mask("+7(999)999-99-99");
}

function toggleBtnMakeOrder() {
    var btn = $('.order-make__total .button');
    if(isValidBlockBuyer()) {
        // btn.removeClass('button--disable');
        btn.attr('disabled', false);
    } else {
        // btn.addClass('button--disable');
        btn.attr('disabled', true);
    }
}

// $('body').on('blur', '#buyer .input-block__input', checkValidInput);

function onCheckInputWithHint(target, type) {
    var isValidInput = (type == 'email') ? isValidEmail(target.val()) : target.val().trim() !== '';
    var errorText = (type == 'email') ? errors.INVALID_EMAIL : errors.EMPTY;
    var text = (type == 'email') ? 'На этот адрес придет электронный чек' : 'Может потребоваться для некоторых видов доставки';
    var inputContainer = target.parent().parent();
    var label = inputContainer.find('.input-block__caption');

    if(!isValidInput) {
        addError(inputContainer, label, errorText)
    } else {
        inputContainer.removeClass('input-block--error');
        label.text(text);
    }
}

$('body').on('blur', '#buyer .input-block__input', function () {
    var $this = $(this);
    var type = $this.attr('type');

    if (!$this.attr('required')) {
        return;
    }

    if(type == 'email') {
        onCheckInputWithHint($this, type)

        $this.on('input', function () {
            onCheckInputWithHint($this,type);
        });
    } else {
        onValidInput($this, type);
    }
});


function onInputListeners() {
    var inputTel = $('#buyer [type="tel"]');
    $('body').on('blur', '#buyer .input-block__input', goToPaymentStep);
    $('body').on('change', '#buyer .input-block-checkbox__input', goToPaymentStep);

    inputTel.on('blur', '#buyer [type="tel"]', goToPaymentStep);

    inputTel.mask("+7(999)999-99-99", {
        completed: function () {
            goToPaymentStep();
        },
    });
}

function isValidBlockBuyer() {
    var input = $('#buyer .input-block__input')
    var inputCheckbox = $('#buyer .input-block-checkbox__input');
    var isValid = true;
    input.each(function () {
        var $this = $(this);

        if (!$this.attr('required')) {
            return;
        }

        var isValidInput = false;
        var type = $this.attr('type');
        switch (type) {
            case 'tel':
                isValidInput = $this.mask().length === 10;
                break;
            case 'email':
                isValidInput = isValidEmail($this.val());
                break;
            default:
                isValidInput = $this.val().trim() !== '';
        }
        isValid = isValid && isValidInput;
    });
    isValid = isValid && inputCheckbox.prop("checked");
    return isValid;
}

function showErrorsPaymentBlock() {
    var input = $('#buyer .input-block__input[required]');
    var checkbox = $('#buyer .input-block-checkbox__input');

    if(!checkbox.prop('checked')) {
        checkbox.parent().addClass('input-block-checkbox--error');
    }

    input.each(function () {
        var $this = $(this);
        var type = $this.attr('type');

        if(type == 'email') {
            onCheckInputWithHint($this, type)
        } else {
            checkValidInputs($this, type);
        }
    })
}

function showErrorCheckbox(checkbox) {
    if(checkbox.prop('checked')) {
        checkbox.parent().removeClass('input-block-checkbox--error');
    } else {
        checkbox.parent().addClass('input-block-checkbox--error');
    }
}

var orderMakeStepMap = {
    BUYER: 'buyer',
    PAYMENT: 'payment'
}

function orderMakeNextStep(block) {
    getScrollToBlock(block);
    OnOpenAccordion(block);
}

function initOrderPreloader() {
    var $preloader = $(document).find('.js-order-preloader');
    if ($preloader.length) {
        $preloader.addClass('show');
    }
}

function unInitOrderPreloader() {
    var $preloader = $(document).find('.js-order-preloader');
    if ($preloader.length) {
        $preloader.removeClass('show');
    }
}

$(document).on('input', '.bx-ui-sls-fake', function () {
    var value = $(this).val().trim();

    if(value !== '') {
        $('.order-make__location-list').css('opacity', 0);
    } else {
        $('.order-make__location-list').attr('style', false);
    }
});

$(document).on('focus', '.bx-ui-sls-fake', function () {
    var value = $(this).val().trim();
    if(value !== '') {
        $('.order-make__location-list').css('opacity', 0);
    } else {
        $('.order-make__location-list').attr('style', false);
    }
});

$(document).on('blur', '.bx-ui-sls-fake', function () {
    $('.order-make__location-list').attr('style', false);
})