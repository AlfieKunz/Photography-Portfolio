/*!
* Start Bootstrap - Creative v7.0.7 (https://startbootstrap.com/theme/creative)
* Copyright 2013-2023 Start Bootstrap
* Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-creative/blob/master/LICENSE)
*/
//
// Scripts
// 

window.addEventListener('DOMContentLoaded', event => {

    // Navbar shrink function
    let HamburgerActive = false;
    var navbarShrink = function () {
        const navbarCollapsible = document.body.querySelector('#mainNav');
        if (!navbarCollapsible) { // stops scroll from undoing hamburder toggle animation.
            return;
        }
        if (HamburgerActive) {
            navbarToggler.click();
            HamburgerActive = false;
        }
        if (window.scrollY === 0) {
            navbarCollapsible.classList.remove('navbar-shrink')
        } else {
            navbarCollapsible.classList.add('navbar-shrink')
        }
    };

    // Shrink the navbar 
    navbarShrink();

    // Shrink the navbar when page is scrolled
    document.addEventListener('scroll', navbarShrink);

    // Activate Bootstrap scrollspy on the main nav element
    const mainNav = document.body.querySelector('#mainNav');
    if (mainNav) {
        new bootstrap.ScrollSpy(document.body, {
            target: '#mainNav',
            rootMargin: '0px 0px -40%',
        });
    };

    // Collapse responsive navbar when toggler is visible
    const navbarToggler = document.body.querySelector('.navbar-toggler');

    //Hamburger button controls:
    if (navbarToggler) {
        navbarToggler.addEventListener('click', function () {
            const navbarCollapsible = document.body.querySelector('#mainNav');
            if (!navbarCollapsible) {
                return;
            }
            const isCollapsed = document.getElementById('navbarResponsive').classList.contains('show');
            
            if (isCollapsed) {
                HamburgerActive = false;
            } else {
                HamburgerActive = true;
                navbarCollapsible.classList.add('navbar-shrink');
            }
        });
    }


    const responsiveNavItems = [].slice.call(
        document.querySelectorAll('#navbarResponsive .nav-link')
    );
    responsiveNavItems.map(function (responsiveNavItem) {
        responsiveNavItem.addEventListener('click', () => {
            if (window.getComputedStyle(navbarToggler).display !== 'none') {
                navbarToggler.click();
                HamburgerActive = false;
            }
        });
    });


    // controls for making picture captions show on mobile devices.
    const lacksHoverSupport = window.matchMedia('(hover: none), (pointer: coarse)').matches;
    const isMobileScreen = window.matchMedia('(max-width: 991px)').matches;
    const onePictureMode = window.matchMedia('(max-width: 575px)').matches;

    if (lacksHoverSupport && isMobileScreen) {
        const portfolioBoxes = document.querySelectorAll('#portfolio .portfolio-box');
        let currentlyVisibleCaption = null; // Track the currently shown caption element

        if (portfolioBoxes.length > 0) {
            // --- Intersection Observer Setup ---

            const observerOptions = {
                root: null,
                rootMargin: '-35% 0px -27% 0px',
                threshold: 0.60
            };

            const handleIntersect = (entries, observer) => {
                entries.forEach(entry => {
                    const targetBox = entry.target;
                    const caption = targetBox.querySelector('.portfolio-box-caption');
                    if (!caption) return;

                    if (entry.isIntersecting) {
                        // Photo entering centre...
                        if (currentlyVisibleCaption && currentlyVisibleCaption !== caption) {
                            currentlyVisibleCaption.classList.remove('is-visible');
                        }
                        caption.classList.add('is-visible');
                        if (onePictureMode) {
                            currentlyVisibleCaption = caption;
                        }

                    } else {
                        // Photo leaving centre...
                        caption.classList.remove('is-visible');
                        if (currentlyVisibleCaption === caption) {
                            currentlyVisibleCaption = null;
                        }
                    }
                });
            };

            const observer = new IntersectionObserver(handleIntersect, observerOptions);
            portfolioBoxes.forEach(box => {
                observer.observe(box);
            });
        }
    }

});
