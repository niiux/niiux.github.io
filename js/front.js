'use strict';

window.addEventListener('DOMContentLoaded', function () {
    /* =====================================
        DESTINATIONS SLIDER
    ======================================== */
    var destinationsSlider = new Swiper('.destinations-slider', {
        slidesPerView: 1,
        spaceBetween: 10,
        centeredSlides: true,
        simulateTouch: false,
        loop: true,
        breakpoints: {
            551: {
                slidesPerView: 2,
            },
            991: {
                slidesPerView: 3,
            },
            1200: {
                slidesPerView: 4,
            },
            1700: {
                slidesPerView: 5,
            },
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
    });

    /* =====================================
        SPONSORS SLIDER
    ======================================== */
    var sponsorsSlider = new Swiper('.sponsors-slider', {
        slidesPerView: 1,
        spaceBetween: 10,
        loop: true,
        autoplay: true,
        delay: 4000,
        breakpoints: {
            551: {
                slidesPerView: 4,
            },
            991: {
                slidesPerView: 5,
            },
            1200: {
                slidesPerView: 8,
            },
        },
    });
});
