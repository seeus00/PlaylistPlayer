const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let audioSource = null;
let analyser = null;


function animate() {
    analyser.fftSize = 128;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const barWidth = 10 / bufferLength;

    const canvas = document.getElementById('visualizerCanvas');
    if (canvas === null) return;

    const ctx = canvas.getContext('2d');

    let x = 0;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    analyser.getByteFrequencyData(dataArray);
    for (let i = 0; i < bufferLength; i++) {
        let barHeight = dataArray[i];
        ctx.fillStyle = "red";
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth;
    }

    window.requestAnimationFrame(animate);
}


export function MusicAnalyzer(props) {
    audioSource = audioCtx.createMediaStreamSource(props.audioSource.current.url)
    analyser = audioCtx.createAnalyser()
    audioSource.connect(analyser)
    analyser.connect(audioCtx.destination)

    return (
        <div>
            <canvas id="visualizerCanvas">{animate()}</canvas>
        </div>)
}