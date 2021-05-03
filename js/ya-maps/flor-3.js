//пример объект карта, открытые методы используются в функциях работы с другими объектами


/**
 * инициализация карты для order make
 * принимает координаты полигона и cb
 * */
function orderMap(params) {

    var map = {
        _myMap: false,
        _center: [55.73, 37.75],
        _zoom: 9,
        _myPoint: false,
        _polygon: false,
        _placemark: false,

        returtDefaultState: function() {
            if(!!this._myPoint && this._myMap) {
                this._myMap.geoObjects
                    .remove(this._myPoint)
                this._myPoint = false;
                this._myMap.setCenter(this._center);
                this._myMap.setZoom(this._zoom);

            }
        },

        getDistancetoPoligon: function () {
            return this._polygon.geometry.getClosest(this._placemark.geometry.getCoordinates()).distance;
        },

        isContainsPoligon: function() {
            return this._polygon.geometry.contains(this._placemark.geometry.getCoordinates());
        },

        _renderPoligon: function() {
            this._polygon.options.set('visible', false);
            this._myMap.geoObjects
                .add(this._polygon)
        },

        _renderPlacemark: function() {
            this._myMap.geoObjects
                .add(this._placemark)

            // Область видимости геообъекта.
            var bounds = this._myPoint.properties.get('boundedBy');

            // Масштабируем карту на область видимости геообъекта.
            this._myMap.setBounds(bounds, {
                // Проверяем наличие тайлов на данном масштабе.
                checkZoomRange: true
            });
        },


        renderPlacemark: function(myPoint) {
            this._myPoint = myPoint;

            // удаляет старый Placemark
            if(!!this._placemark) {
                this._myMap.geoObjects
                    .remove(this._placemark)
                this._placemark = false;
            }

            this._placemark = new ymaps.Placemark(this._myPoint.geometry.getCoordinates());
            this._renderPlacemark();


            if(!this._polygon) {
                this._polygon = new ymaps.Polygon(params.polygon.coordinates);
                this._renderPoligon();
            }
        },

        getCoordinates: function(params) {
            ymaps.geocode(params.adress, {
                results: 1
            }).then(function (res) {
                // Выбираем первый результат геокодирования.
                var firstGeoObject = res.geoObjects.get(0);
                params.success(firstGeoObject);
            })
                .catch(function (data) {
                    params.error();
                });
        },

        _renderMap: function() {
            this._myMap = new ymaps.Map("ya-map", {
                center: this._center,
                zoom: this._zoom,
            });

            this._myMap.controls.remove('searchControl');
            // обработчик на изменение адреса доставки
            params.callbacks.afterInit();
        },

        init: function () {
            var _this = this;
            $(document).ready(function () {
                if($('#ya-map').length) {
                    ymaps.ready(function () {
                        _this._renderMap()
                    });
                }
            })
        }
    }

    return map;
}

/**
 * возвращает стоимость доставки
 * принимает базовую цену, расстояние в км, цену заказа
 *
 * */
function isValueDeliveryPrice(basePrice, distance, orderPrice) {
    var FIX_ORDER_VALUE =  2500,
        RATE = 40,
        MIN_RATE = 300,
        basePrice = Number(basePrice);

    if(orderPrice < FIX_ORDER_VALUE) {
        var price = MIN_RATE + basePrice + (distance * RATE);

    } else if(orderPrice >= FIX_ORDER_VALUE) {
        var price = (distance - ((orderPrice - FIX_ORDER_VALUE) / 100)) * RATE + basePrice;
    }

    // в некоторых случаях формула возвращает отрицательные значения
    price = (price < 0) ? 0 : price;

    return price;
};

/**
 * возвращает стоимость доставки
 * принимает базовую цену
 *
 * */
function getPrice(basePrice) {
    var _distance = orderMakeMap.getDistancetoPoligon();
    //яндекс возвращает метры, переводим в километры
    var distance = Math.ceil(_distance/1000);
    var orderPrice = Number($('[data-total-price]').attr('data-total-price'));
    return isValueDeliveryPrice(basePrice, distance, orderPrice)
}

/**
 * при ошибки получения координат
 * */
function errorGetCoordinates() {
    console.log('ошибка получения координат!')
}

/***
 * отрисовывает точку на карте, запускает обработчик клика на тип доставки,
 * если доставка за МКАД, рендерит стоимость доставки
 * */
function successGetCoordinates(point) {
    orderMakeMap.renderPlacemark(point);

    var isCheckedOutsideMKAD = $('[data-delivery-name="outsideMKAD"]').attr('data-selected') == 'true';

    // если выбрана доставка по москве то больше ничего не происходит
    if(!isCheckedOutsideMKAD) return;

    // дополнительная проверка что координаты за пределом МКАД
    if(!orderMakeMap.isContainsPoligon()) {

        $(document).on('change', '.js-delivery-type-change', function () {

            var basePrice = $(this).attr('data-base-price');

            var deliveryPrice = getPrice(basePrice)
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

/**
 * слушатель для полей ввода адреса доставки
 * получает координаты адреса и выполняет successGetCoordinates в случае получение координат
 * errorGetCoordinates в случае ошибки
 * */
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

    orderMakeMap.getCoordinates({
        adress:  adress,
        success: function (point) {
            successGetCoordinates(point)
        },
        error: function () {
            errorGetCoordinates()
        },

    });
};


var paramsInitMap = {
    polygon: coordMKAD,
    callbacks: {
        afterInit: function () {
            $(document).on('input', '[data-required]', debounce(watcherInputAdress, 1000));

            $(document).on('click', '[data-controls="delivery"]', function () {
                clearDeliveryField();
                orderMakeMap.returtDefaultState();
            });
        }
    }
};

// инициализация карты
var orderMakeMap = orderMap(paramsInitMap);
orderMakeMap.init();
