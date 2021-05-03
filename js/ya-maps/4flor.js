// все фукнции обернуты в один объект

function orderMap() {

    var map = {
        _myMap: false,
        _center: [55.73, 37.75],
        _zoom: 9,
        _myPoint: false,
        _polygon: false,
        _placemark: false,
        _FIX_ORDER_VALUE: 2500,
        _RATE: 40,
        _MIN_RATE: 300,
        _debounce: function (context, func, wait, immediate) {
            // console.log(func)
            var timeout;

            return function executedFunction() {
                // var context = this;
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
        },

        returtDefaultState: function() {
            if(!!this._myPoint && this._myMap) {
                this._myMap.geoObjects
                    .remove(this._myPoint)
                this._myPoint = false;
                this._myMap.setCenter(this._center);
                this._myMap.setZoom(this._zoom);

            }
        },

        _getDistancetoPoligon() {
            console.log(this._polygon)
            console.log()
            return this._polygon.geometry.getClosest(this._placemark.geometry.getCoordinates()).distance;
        },


        _isValueDeliveryPrice: function(basePrice) {
            var _distance = this._getDistancetoPoligon();
            var orderPrice = Number($('[data-total-price]').attr('data-total-price'));
            var basePrice = Number(basePrice);


            //яндекс возвращает метры, переводим в километры
            var distance = Math.ceil(_distance/1000);

            if(orderPrice < this._FIX_ORDER_VALUE) {
                var price = this._MIN_RATE + basePrice + (distance * this._RATE);

            } else if(orderPrice >= this._FIX_ORDER_VALUE) {
                var price = (distance - ((orderPrice - this._FIX_ORDER_VALUE) / 100)) * this._RATE + basePrice;
            }

            // в некоторых случаях формула возвращает отрицательные значения
            price = (price < 0) ? 0 : price;

            return price;
        },

        _isContainsPoligon: function() {
            return this._polygon.geometry.contains(this._placemark.geometry.getCoordinates());
        },

        _renderPoligon: function() {
            this._polygon.options.set('visible', false);
            this._myMap.geoObjects
                .add(this._polygon)
        },

        _renderPlacemark: function() {
            console.log(this)
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


        _init: function() {
            var isCheckedOutsideMKAD = $('[data-delivery-name="outsideMKAD"]').attr('data-selected') == 'true';
            // удаляет старый Placemark
            if(!!this._placemark) {
                this._myMap.geoObjects
                    .remove(this._placemark)
                this._placemark = false;
            }

            this._placemark = new ymaps.Placemark(this._myPoint.geometry.getCoordinates());
            this._renderPlacemark();


            if(!this._polygon) {
                this._polygon = new ymaps.Polygon(coordMKAD.coordinates);
                console.log(this._polygon)
                this._renderPoligon(myMap, myPolygon);
            }

            // если не выбрана доставка за МКАД
            if(!isCheckedOutsideMKAD) return;

            // проверка яндекс API, что доставка за МКАД
            if(!this._isContainsPoligon(myPolygon, myPoint)) {
                var _this = this;

                $(document).on('change', '.js-delivery-type-change', function () {
                    var basePrice = $(this).attr('data-base-price');
                    var deliveryPrice = _this._isValueDeliveryPrice(basePrice)
                    // рендер в выбранном варианте доставки
                    $(this).parent().find('.custom-radio__deliveryPrice').text(deliveryPrice);
                    // добавляю в скрытый инпут
                    $('[data-id="delivery-price"]').val(deliveryPrice)
                })

                // тут навешивается обработчик на кнопку "далее"?
            } else {
                console.log('Указанный адрес находится в пределах МКАД');
            }

        },

        _getCoordinates: function(adress) {
            var _this = this;
            ymaps.geocode(adress, {
                results: 1
            }).then(function (res) {
                // Выбираем первый результат геокодирования.
                var firstGeoObject = res.geoObjects.get(0);
                _this._myPoint = firstGeoObject;
                _this._init();

            })
                .catch(function (data) {
                    console.log('ошибка получения адреса');
                });

        },

        _watcherInputAdress: function() {
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

            this._getCoordinates(adress);
        },

        _renderMap: function() {
            this._myMap = new ymaps.Map("ya-map", {
                center: this._center,
                zoom: this._zoom,
            });

            this._myMap.controls.remove('searchControl');
            var _this = this;
            // обработчик на изменение адреса доставки
            $(document).on('input', '[data-required]', _this._debounce(this, _this._watcherInputAdress, 1000));
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

var orderMakeMap = orderMap();
orderMakeMap.init();

$(document).on('click', '[data-controls="delivery"]', function () {
    clearDeliveryField();
    orderMakeMap.returtDefaultState();

});
