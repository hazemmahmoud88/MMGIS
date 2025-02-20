import $ from 'jquery'
import * as d3 from 'd3'

import F_ from '../Formulae_/Formulae_'
import L_ from '../Layers_/Layers_'

import QueryURL from '../../Ancillary/QueryURL'
import Modal from '../../Ancillary/Modal'
import HTML2Canvas from 'html2canvas'
import tippy from 'tippy.js'

import './BottomBar.css'

let BottomBar = {
    UI_: null,
    settings: {},
    init: function (containerId, UI) {
        this.UI_ = UI
        const bottomBar = d3.select(`#${containerId}`)

        // Copy Link
        bottomBar
            .append('i')
            .attr('id', 'topBarLink')
            .attr('tabindex', 100)
            .attr('class', 'mmgisHoverBlue mdi mdi-open-in-new mdi-18px')
            .style('padding', '5px 10px')
            .style('width', '40px')
            .style('height', '36px')
            .style('line-height', '26px')
            .style('cursor', 'pointer')
            .on('click', function () {
                const linkButton = $(this)
                QueryURL.writeCoordinateURL(true, function () {
                    F_.copyToClipboard(L_.url)

                    linkButton.removeClass('mdi-open-in-new')
                    linkButton.addClass('mdi-check-bold')
                    linkButton.css('color', 'var(--color-green)')
                    setTimeout(() => {
                        linkButton.removeClass('mdi-check-bold')
                        linkButton.css('color', '')
                        linkButton.addClass('mdi-open-in-new')
                    }, 3000)
                })
            })

        tippy(`#topBarLink`, {
            content: `Copy Link`,
            placement: 'right',
            theme: 'blue',
        })

        // Screenshot
        bottomBar
            .append('i')
            .attr('id', 'topBarScreenshot')
            .attr('title', 'Screenshot')
            .attr('tabindex', 101)
            .attr('class', 'mmgisHoverBlue mdi mdi-camera mdi-18px')
            .style('padding', '5px 10px')
            .style('width', '40px')
            .style('height', '36px')
            .style('line-height', '26px')
            .style('cursor', 'pointer')
            .style('opacity', '0.8')
            .on('click', function () {
                //We need to manually order leaflet z-indices for this to work
                let zIndices = []
                $('#mapScreen #map .leaflet-tile-pane')
                    .children()
                    .each(function (i, elm) {
                        zIndices.push($(elm).css('z-index'))
                        $(elm).css('z-index', i + 1)
                    })
                $('.leaflet-control-scalefactor').css('display', 'none')
                $('#mmgis-map-compass').css('display', 'none')
                $('.leaflet-control-zoom').css('display', 'none')
                $('#topBarScreenshotLoading').css('display', 'block')
                $('#scaleBar').css('margin-top', '0px')

                const documentElm = document.getElementById('mapScreen')
                HTML2Canvas(documentElm, {
                    allowTaint: true,
                    useCORS: true,
                    logging: false,
                    scrollX: -window.scrollX,
                    scrollY: -window.scrollY,
                    windowWidth: documentElm.offsetWidth,
                    windowHeight: documentElm.offsetHeight,
                    onclone: function (e) {
                        // Fix svg layer shift
                        const originalSVG = document.body.querySelectorAll(
                            'svg.leaflet-zoom-animated'
                        )
                        const copySVG = e.body.querySelectorAll(
                            'svg.leaflet-zoom-animated'
                        )
                        copySVG.forEach((copyEle, i) => {
                            const attribute = originalSVG
                                .item(i)
                                .getAttribute('style')
                            const parentElement = copyEle.parentElement
                            parentElement.removeChild(copyEle)
                            const temp = document.createElement('div')
                            temp.appendChild(copyEle)
                            parentElement.appendChild(temp)
                            temp.setAttribute('style', attribute)
                            copyEle.removeAttribute('style')
                        })

                        // Fix tile layer z-indices
                        const originalZ = document.body.querySelectorAll(
                            '.leaflet-tile-pane > div.leaflet-layer'
                        )
                        const copyZ = e.body.querySelectorAll(
                            '.leaflet-tile-pane > div.leaflet-layer'
                        )
                        copyZ.forEach((copyEle, i) => {
                            const attribute = originalZ
                                .item(i)
                                .getAttribute('style')
                            copyEle.setAttribute('style', attribute)
                        })
                    },
                }).then(function (canvas) {
                    canvas.id = 'mmgisScreenshot'
                    document.body.appendChild(canvas)
                    F_.downloadCanvas(
                        canvas.id,
                        'mmgis-screenshot',
                        function () {
                            canvas.remove()
                            setTimeout(function () {
                                $('#topBarScreenshotLoading').css(
                                    'display',
                                    'none'
                                )
                            }, 2000)
                        }
                    )
                })
                $('#mapScreen #map .leaflet-tile-pane')
                    .children()
                    .each(function (i, elm) {
                        $(elm).css('z-index', zIndices[i])
                    })
                $('.leaflet-control-scalefactor').css('display', 'flex')
                $('#mmgis-map-compass').css('display', 'block')
                $('.leaflet-control-zoom').css('display', 'block')
                $('#scaleBar').css('margin-top', '5px')
            })

        tippy(`#topBarScreenshot`, {
            content: `Take Screenshot`,
            placement: 'right',
            theme: 'blue',
        })

        // Screenshot loading
        d3.select('#topBarScreenshot')
            .append('i')
            .attr('id', 'topBarScreenshotLoading')
            .attr(
                'title',
                'Taking Screenshot...\nYou may need to permit multiple downloads in your browser.'
            )
            .attr('tabindex', 102)
            .style('display', 'none')
            .style('border-radius', '50%')
            .style('border', '8px solid #ffe100')
            .style('border-right-color', 'transparent')
            .style('border-left-color', 'transparent')
            .style('position', 'relative')
            .style('top', '3px')
            .style('left', '-17px')
            .style('width', '20px')
            .style('height', '20px')
            .style('line-height', '26px')
            .style('color', '#d2b800')
            .style('cursor', 'pointer')
            .style('animation-name', 'rotate-forever')
            .style('animation-duration', '2s')
            .style('animation-iteration-count', 'infinite')
            .style('animation-timing', 'linear')

        // Fullscreen
        bottomBar
            .append('i')
            .attr('id', 'topBarFullscreen')
            .attr('tabindex', 103)
            .attr('class', 'mmgisHoverBlue mdi mdi-fullscreen mdi-18px')
            .style('padding', '5px 10px')
            .style('width', '40px')
            .style('height', '36px')
            .style('line-height', '26px')
            .style('cursor', 'pointer')
            .on('click', function () {
                BottomBar.fullscreen()
                if (
                    d3.select(this).attr('class') ==
                    'mmgisHoverBlue mdi mdi-fullscreen mdi-18px'
                )
                    d3.select(this)
                        .attr(
                            'class',
                            'mmgisHoverBlue mdi mdi-fullscreen-exit mdi-18px'
                        )
                        .attr('title', 'Exit Fullscreen')
                else
                    d3.select(this)
                        .attr(
                            'class',
                            'mmgisHoverBlue mdi mdi-fullscreen mdi-18px'
                        )
                        .attr('title', 'Fullscreen')
            })

        tippy(`#topBarFullscreen`, {
            content: `Fullscreen`,
            placement: 'right',
            theme: 'blue',
        })

        // Settings
        bottomBar
            .append('i')
            .attr('id', 'bottomBarSettings')
            .attr('tabindex', 104)
            .attr('class', 'mmgisHoverBlue mdi mdi-settings mdi-18px')
            .style('padding', '5px 10px')
            .style('width', '40px')
            .style('height', '36px')
            .style('line-height', '26px')
            .style('cursor', 'pointer')
            .on('click', function () {
                const that = $('#bottomBarSettings')
                const wasOn = that.hasClass('active')
                BottomBar.toggleSettings(!wasOn)
            })

        tippy(`#bottomBarSettings`, {
            content: `Settings`,
            placement: 'right',
            theme: 'blue',
        })

        // Help
        bottomBar
            .append('i')
            .attr('id', 'topBarHelp')
            .attr('title', 'Help')
            .attr('tabindex', 105)
            .attr('class', 'mmgisHoverBlue mdi mdi-help mdi-18px')
            .style('padding', '5px 10px')
            .style('width', '40px')
            .style('height', '36px')
            .style('line-height', '26px')
            .style('cursor', 'pointer')
            .on('click', function () {
                this.helpOn = !this.helpOn
                if (this.helpOn) {
                    //d3.select('#viewer_Help').style('display', 'inherit')
                } else {
                    d3.select('#viewer_Help').style('display', 'none')
                }
            })

        tippy(`#topBarHelp`, {
            content: `Help`,
            placement: 'right',
            theme: 'blue',
        })
    },
    toggleSettings: function (on) {
        if (on) {
            BottomBar.settings.visibility = BottomBar.settings.visibility || {
                topbar: true,
                toolbars: true,
                scalebar: true,
                coordinates: true,
                graticule: this.UI_.Map_.graticule != null,
                miscellaneous: true,
            }
            // prettier-ignore
            const modalContent = [
                `<div id='mainSettingsModal'>`,
                    `<div id='mainSettingsModalTitle'>`,
                        `<div><i class='mdi mdi-settings mdi-18px'></i><div>Settings</div></div>`,
                        `<div id='mainSettingsModalClose'><i class='mmgisHoverBlue mdi mdi-close mdi-18px'></i></div>`,
                    `</div>`,
                    `<div id='mainSettingsModalContent'>`,
                        `<div class='mainSettingsModalSection' id='mainSettingsModalSectionUIVisibility'>`,
                            `<div class='mainSettingsModalSectionTitle'>User Interface Visibility</div>`,
                            `<ul class='mainSettingsModalSectionOptions'>`,
                                `<li>`,
                                    `<div class="mmgis-checkbox"><input type="checkbox" ${BottomBar.settings.visibility.topbar ? 'checked ' : ''}id="checkbox_msmsUIV1" value='topbar'/><label for="checkbox_msmsUIV1"></label></div>`,
                                    `<div>Top Bar</div>`,
                                `</li>`,
                                /* For now because then we need a way to open the settings modal again
                                `<li>`,
                                    `<div class="mmgis-checkbox"><input type="checkbox" ${BottomBar.settings.visibility.toolbars ? 'checked ' : ''}id="checkbox_msmsUIV2" value='toolbars'/><label for="checkbox_msmsUIV2"></label></div>`,
                                    `<div>Toolbars</div>`,
                                `</li>`,
                                */
                                `<li>`,
                                    `<div class="mmgis-checkbox"><input type="checkbox" ${BottomBar.settings.visibility.scalebar ? 'checked ' : ''}id="checkbox_msmsUIV3" value='scalebar'/><label for="checkbox_msmsUIV3"></label></div>`,
                                    `<div>Scale Bar</div>`,
                                `</li>`,
                                `<li>`,
                                    `<div class="mmgis-checkbox"><input type="checkbox" ${BottomBar.settings.visibility.coordinates ? 'checked ' : ''}id="checkbox_msmsUIV4" value='coordinates'/><label for="checkbox_msmsUIV4"></label></div>`,
                                    `<div>Coordinates</div>`,
                                `</li>`,
                                `<li>`,
                                    `<div class="mmgis-checkbox"><input type="checkbox" ${BottomBar.settings.visibility.graticule ? 'checked ' : ''}id="checkbox_msmsUIV5" value='graticule'/><label for="checkbox_msmsUIV5"></label></div>`,
                                    `<div>Graticule</div>`,
                                `</li>`,
                                `<li>`,
                                    `<div class="mmgis-checkbox"><input type="checkbox" ${BottomBar.settings.visibility.miscellaneous ? 'checked ' : ''}id="checkbox_msmsUIV6" value='miscellaneous'/><label for="checkbox_msmsUIV6"></label></div>`,
                                    `<div>Miscellaneous</div>`,
                                `</li>`,
                            `</ul>`,
                        `</div>`,
                        (L_.Globe_ ? 
                            [`<div class='mainSettingsModalSection' id='mainSettingsModalSection3DGlobe'>`,
                                `<div class='mainSettingsModalSectionTitle'>3D Globe</div>`,
                                `<ul class='mainSettingsModalSectionOptions'>`,
                                    `<li class='flexbetween'>`,
                                        `<div>Radius of Tiles<i title='Number of tiles to query out from the center in the Globe view.\nThe higher the number, the more data queried in the distance (which may hurt performance).\n' class="infoIcon mdi mdi-information mdi-12px"></i></div>`,
                                        `<div class='flexbetween'>`,
                                            `<div id='globeRadiusOfTilesValue' style='padding: 0px 6px;'>${L_.Globe_.litho.options.radiusOfTiles}</div>`,
                                            `<input id='globeSetRadiusOfTiles' class="slider2" type="range" min="4" max="11" step="1" value="${L_.Globe_.litho.options.radiusOfTiles}"/>`,
                                        `</div>`,
                                    `</li>`,
                                `</ul>`,
                            `</div>`].join('') : ''),
                    `</div>`,
                `</div>`
            ].join('\n')

            Modal.set(
                modalContent,
                function () {
                    $('#mainSettingsModalClose').on('click', function () {
                        Modal.remove()
                    })
                    // UI Visibility
                    $(
                        `#mainSettingsModalSectionUIVisibility .mmgis-checkbox > input`
                    ).on('click', function () {
                        const checked = $(this).prop('checked')
                        const value = $(this).attr('value')

                        BottomBar.settings.visibility[value] = checked

                        if (!checked) {
                            // now on
                            switch (value) {
                                case 'topbar':
                                    $('#topBar').css('display', 'none')
                                    break
                                case 'toolbars':
                                    $('#mmgislogo').css('display', 'none')
                                    $('#barBottom').css('display', 'none')
                                    $('#toolbar').css({
                                        display: 'none',
                                        width: '0px',
                                    })
                                    $('#viewerToolBar').css('display', 'none')
                                    $('#_lithosphere_controls').css(
                                        'display',
                                        'none'
                                    )
                                    $('#splitscreens').css({
                                        left: '0px',
                                        width: '100%',
                                    })
                                    $('#mapScreen').css(
                                        'width',
                                        $('#mapScreen').width() + 40 + 'px'
                                    )
                                    BottomBar.UI_.topSize = 0
                                    window.dispatchEvent(new Event('resize'))
                                    break
                                case 'scalebar':
                                    $('#scaleBarBounds').css('display', 'none')
                                    break
                                case 'coordinates':
                                    $('#CoordinatesDiv').css('display', 'none')
                                    break
                                case 'graticule':
                                    BottomBar.UI_.Map_.toggleGraticule(false)
                                    break
                                case 'miscellaneous':
                                    $('.leaflet-control-container').css(
                                        'display',
                                        'none'
                                    )
                                    $('.splitterVInner').css('display', 'none')
                                    break
                                default:
                                    break
                            }
                        } else {
                            // now off
                            switch (value) {
                                case 'topbar':
                                    $('#topBar').css('display', 'flex')
                                    break
                                case 'toolbars':
                                    $('#mmgislogo').css('display', 'inherit')
                                    $('#barBottom').css('display', 'flex')
                                    $('#toolbar').css({
                                        display: 'inherit',
                                        width: '40px',
                                    })
                                    $('#viewerToolBar').css(
                                        'display',
                                        'inherit'
                                    )
                                    $('#_lithosphere_controls').css(
                                        'display',
                                        'inherit'
                                    )
                                    $('#splitscreens').css({
                                        left: '40px',
                                        width: 'calc(100% - 40px)',
                                    })
                                    $('#mapScreen').css(
                                        'width',
                                        $('#mapScreen').width() - 40 + 'px'
                                    )
                                    BottomBar.UI_.topSize = 40
                                    window.dispatchEvent(new Event('resize'))
                                    break
                                case 'scalebar':
                                    $('#scaleBarBounds').css(
                                        'display',
                                        'inherit'
                                    )
                                    break
                                case 'coordinates':
                                    $('#CoordinatesDiv').css('display', 'flex')
                                    break
                                case 'graticule':
                                    BottomBar.UI_.Map_.toggleGraticule(true)
                                    break
                                case 'miscellaneous':
                                    $('.leaflet-control-container').css(
                                        'display',
                                        'block'
                                    )
                                    $('.splitterVInner').css(
                                        'display',
                                        'inline-flex'
                                    )
                                    break
                                default:
                                    break
                            }
                        }
                    })

                    // 3d Globe
                    // Radius of Tiles
                    $(
                        '#mainSettingsModalSection3DGlobe #globeSetRadiusOfTiles'
                    ).on('input', function () {
                        if (L_.Globe_) {
                            L_.Globe_.litho.options.radiusOfTiles = parseInt(
                                $(this).val()
                            )
                            $(
                                '#mainSettingsModalSection3DGlobe #globeRadiusOfTilesValue'
                            ).text(L_.Globe_.litho.options.radiusOfTiles)
                        }
                    })
                },
                function () {}
            )
        } else {
        }
    },
    toggleHelp: function () {},
    fullscreen: function () {
        var isInFullScreen =
            (document.fullscreenElement &&
                document.fullscreenElement !== null) ||
            (document.webkitFullscreenElement &&
                document.webkitFullscreenElement !== null) ||
            (document.mozFullScreenElement &&
                document.mozFullScreenElement !== null) ||
            (document.msFullscreenElement &&
                document.msFullscreenElement !== null)

        var docElm = document.documentElement
        if (!isInFullScreen) {
            if (docElm.requestFullscreen) {
                docElm.requestFullscreen()
            } else if (docElm.mozRequestFullScreen) {
                docElm.mozRequestFullScreen()
            } else if (docElm.webkitRequestFullScreen) {
                docElm.webkitRequestFullScreen()
            } else if (docElm.msRequestFullscreen) {
                docElm.msRequestFullscreen()
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen()
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen()
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen()
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen()
            }
        }
    },
}

export default BottomBar
