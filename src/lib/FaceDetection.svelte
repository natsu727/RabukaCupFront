<script>
    import { onMount, createEventDispatcher } from 'svelte';
    // @ts-ignore
    import * as tf from '@tensorflow/tfjs';
    import * as blazeface from '@tensorflow-models/blazeface';
  
    // @ts-ignore
    let videoRef;
    const dispatch = createEventDispatcher(); // イベントディスパッチャを作成
    let hasFace = false;
  
    onMount(async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      // @ts-ignore
      videoRef.srcObject = stream;
      // @ts-ignore
      videoRef.play();
  
      const model = await blazeface.load();
  
      const detectFaces = async () => {
        // @ts-ignore
        const predictions = await model.estimateFaces(videoRef, false);
        const detected = predictions.length > 0;
  
        if (hasFace !== detected) {
          hasFace = detected;
          dispatch('faceDetected', { hasFace }); // イベントを親に通知
        }
  
        requestAnimationFrame(detectFaces);
      };
  
      detectFaces();
    });
  </script>
  
  <video bind:this={videoRef} style="display: none;"></video>
  