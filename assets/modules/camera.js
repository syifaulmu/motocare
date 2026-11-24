/**
 * MotoCare v2.0 - Live Camera Inspection Module
 * Manages mediaDevices getUserMedia video stream, camera flip, and snapshot preview.
 */
(function (root, factory) {
    const exported = factory();
    if (typeof root !== 'undefined' && root) {
        root.MotoCare = root.MotoCare || {};
        root.MotoCare.Camera = exported;
    }
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = exported;
    }
})(typeof self !== 'undefined' ? self : typeof globalThis !== 'undefined' ? globalThis : this, function () {
    'use strict';

    let _utils = null;
    let activeCameraStream = null;
    let cameraFacingMode = 'environment';

    function init(deps) {
        _utils = deps && deps.Utils;
        initListeners();
    }

    function open() {
        if (_utils) _utils.openModal('modal-camera');
        startStream();
    }

    function close() {
        stopStream();
        if (_utils) _utils.closeModal('modal-camera');
    }

    function startStream() {
        const video = document.getElementById('camera-stream');
        if (!video || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            if (_utils) _utils.showToast('⚠️ Kamera tidak didukung di perangkat ini.');
            return;
        }

        stopStream();

        const constraints = {
            video: { facingMode: cameraFacingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
            audio: false
        };

        navigator.mediaDevices
            .getUserMedia(constraints)
            .then((stream) => {
                activeCameraStream = stream;
                video.srcObject = stream;
                video.play();
            })
            .catch((err) => {
                console.error('Camera access error:', err);
                if (_utils) _utils.showToast('⚠️ Gagal mengakses kamera: ' + (err.message || 'Izin ditolak'));
            });
    }

    function stopStream() {
        if (activeCameraStream) {
            activeCameraStream.getTracks().forEach((t) => t.stop());
            activeCameraStream = null;
        }
        const video = document.getElementById('camera-stream');
        if (video) video.srcObject = null;
    }

    function flip() {
        cameraFacingMode = cameraFacingMode === 'environment' ? 'user' : 'environment';
        startStream();
        if (_utils) _utils.showToast('Membalik kamera...');
    }

    function snap() {
        const video = document.getElementById('camera-stream');
        const canvas = document.getElementById('camera-canvas');
        if (!video || !canvas) return;

        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        if (_utils) _utils.showToast('📸 Foto pemeriksaan fisik tertangkap!');
        if (typeof window !== 'undefined' && window.Android && window.Android.vibrate) {
            window.Android.vibrate(50);
        }
    }

    function initListeners() {
        const btnOpenCamera = document.getElementById('btn-open-camera');
        if (btnOpenCamera) btnOpenCamera.addEventListener('click', open);

        const btnCameraClose = document.getElementById('btn-modal-camera-close');
        if (btnCameraClose) btnCameraClose.addEventListener('click', close);

        const btnCameraFlip = document.getElementById('btn-camera-flip');
        if (btnCameraFlip) btnCameraFlip.addEventListener('click', flip);

        const btnCameraSnap = document.getElementById('btn-camera-snap');
        if (btnCameraSnap) btnCameraSnap.addEventListener('click', snap);
    }

    return {
        init,
        open,
        close,
        startStream,
        stopStream,
        flip,
        snap,
        initListeners
    };
});
