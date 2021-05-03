// интерфейс реализован функциями


/**
 * возвращает стоимость доставки
 * принимает полигон, координату доставки, базовый прайс
 * */
function isValueDeliveryPrice(myPolygon, MyPoint, basePrice) {

    var _distance = getDistancetoPoligon(myPolygon, MyPoint)
    var orderPrice = Number($('[data-total-price]').attr('data-total-price'));
    var basePrice = Number(basePrice);

    var FIX_ORDER_VALUE = 2500;
    var RATE = 40;
    var MIN_RATE = 300;

    //яндекс возвращает метры, переводим в километры
    var distance = Math.ceil(_distance/1000);

    if(orderPrice < FIX_ORDER_VALUE) {
        var price = MIN_RATE + basePrice + (distance * RATE);

    } else if(orderPrice >= FIX_ORDER_VALUE) {
        var price = (distance - ((orderPrice - FIX_ORDER_VALUE) / 100)) * RATE + basePrice;
    }

    // в некоторых случаях формула возвращает отрицательные значения
    price = (price < 0) ? 0 : price;

    return price;
}

// получает координаты по адресу, вызывает callback при susess/error
function getCoordinates(params) {
    ymaps.geocode(params.adress, {
        results: 1
    }).then(function (res) {
        // Выбираем первый результат геокодирования.
        var firstGeoObject = res.geoObjects.get(0);
        params.susess(firstGeoObject);
    })
        .catch(function (data) {
            params.error(data);
        });
}

// возвращает вхождение якоря в полигон
function isContainsPoligon(myPolygon, myPoint) {
    return myPolygon.geometry.contains(myPoint.geometry.getCoordinates());
}

// возвращает расстояние в метрах по  прямой между полигоном и якорем
function getDistancetoPoligon(myPolygon, myPoint) {
    return myPolygon.geometry.getClosest(myPoint.geometry.getCoordinates()).distance;
}

var myMap = false;
var myPolygon = false;
var myPoint = false;


function renderPlacemark(myMap, myPoint, point) {
    myMap.geoObjects
        .add(myPoint)

    // Область видимости геообъекта.
    var bounds = point.properties.get('boundedBy');

    // Масштабируем карту на область видимости геообъекта.
    myMap.setBounds(bounds, {
        // Проверяем наличие тайлов на данном масштабе.
        checkZoomRange: true
    });
}

function  renderPoligon(myMap, myPolygon) {
    myPolygon.options.set('visible', false);
    myMap.geoObjects
        .add(myPolygon)
}

function returnIntinialStateMap() {
    if(!!myPoint && myMap) {
        myMap.geoObjects
            .remove(myPoint)
        myPoint = false;
        myMap.setCenter([55.73, 37.75]);
        myMap.setZoom(9);

    }
}

function init(myMap, point) {
    var isCheckedOutsideMKAD = $('[data-delivery-name="outsideMKAD"]').attr('data-selected') == 'true';
    // удаляет старый Placemark
    if(!!myPoint) {
        myMap.geoObjects
            .remove(myPoint)
        myPoint = false;
    }

    myPoint = new ymaps.Placemark(point.geometry.getCoordinates());
    renderPlacemark(myMap, myPoint, point);


    if(!myPolygon) {
        myPolygon = new ymaps.Polygon(coordMKAD.coordinates);
        renderPoligon(myMap, myPolygon);
    }

    // если не выбрана доставка за МКАД
    if(!isCheckedOutsideMKAD) return;

    // проверка яндекс API, что доставка за МКАД
    if(!isContainsPoligon(myPolygon, myPoint)) {

        $(document).on('change', '.js-delivery-type-change', function () {
            var basePrice = $(this).attr('data-base-price');
            var deliveryPrice = isValueDeliveryPrice(myPolygon, myPoint, basePrice)
            // рендер в выбранном варианте доставки
            $(this).parent().find('.custom-radio__deliveryPrice').text(deliveryPrice);
            // добавляю в скрытый инпут
            $('[data-id="delivery-price"]').val(deliveryPrice)
        })

        // тут навешивается обработчик на кнопку "далее"?
    } else {
        console.log('Указанный адрес находится в пределах МКАД');
    }

}

//обработчик событий на заполненность обязательных полей
function watcherInputAdress() {
    var isCheckedOutsideMKAD = $('[data-delivery-name="outsideMKAD"]').attr('data-selected') == 'true';

    if(!isCheckedOutsideMKAD) {
        $('[data-required="city"]').val('Москва');
    }

    var isAllInputFull = true;
    var adress = [];

    $('[data-id="delivery"] [data-required]').each(function () {
        adress.push($(this).val().trim());
        var isEmpty = !$(this).val().trim();
        if(isEmpty) {
            $(this).addClass('tabs__input--error')
        } else {
            $(this).removeClass('tabs__input--error')
        }
        isAllInputFull = isAllInputFull && !isEmpty;
    })

    if(!isAllInputFull) return;
    adress = adress.join(', ');

    getCoordinates({
        myMap: myMap,
        adress: adress,
        susess: function (data) {
            init(myMap, data);

        },
        error: function () {
            console.log('ошибка получения адреса');
        }
    });

}

//функция инициализации карты
function renderMap() {
    myMap = new ymaps.Map("ya-map", {
        center: [55.73, 37.75],
        zoom: 9,
    });

    myMap.controls.remove('searchControl');

    // обработчик на изменение адреса доставки
    $(document).on('input', '[data-required]', debounce(watcherInputAdress, 1000));

}

$(document).ready(function () {
    if($('#ya-map').length) {
        ymaps.ready(renderMap);
    }
})