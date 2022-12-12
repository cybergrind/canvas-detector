<script>
	import { paintCanvas } from './canvasTools.ts'
	import { onMount } from 'svelte'
	import { data as dataRaw } from './image.ts'
	import { sha256 } from './sha256.js'
	
	let data = JSON.parse(dataRaw)
	let width = 100
	let height = 100
	
	let canvas1, canvas2, canvas3
	let hash1, hash2, hash3
	let hash2_1, hash2_2, hash2_3
	let expected = 'ad7ebe1f862254f0e61bbf61c35869ec1e6a4dd5ee26b5f86806fe98ba69601a'
	let expectedSafari = 'a9e62aa930f8d3e1a738258b2911b331f694dbd4be4d64ca7d46157622b43903'
	let expectedDataURL = '722fb0b3367c104c63a385f3c2597c89748a08f75911586c9f7bc26fcadcce57'
	let expectedDataURLSafari = '31cb0d9cbb9794bd80ebe3d7de26fa067d891f8064ce973bc223bd7117ecff47'
	
	
	const getHash = (canvas) => {
		let ctx = canvas.getContext('2d')
		let id = ctx.getImageData(0, 0, width, height)
		let out = []
		for (let i=0;i<id.data.length;i++){
			out.push(id.data[i])
		}
		return sha256['hex'](JSON.stringify(out))
	}
	
	const getHashFromURI = (canvas) => {
		const dataURI = canvas.toDataURL()
		return sha256['hex'](dataURI)
	}
	
	
	onMount(() => {
		const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
		if (isSafari) {
			expected = expectedSafari
			expectedDataURL = expectedDataURLSafari
		}
		console.log('before paint')
		// canvas1
		const canvas = canvas1
		canvas.width = `${width}`
		canvas.height = `${height}`
		const context = canvas.getContext('2d');
		paintCanvas({
			canvas, 
			context, 
			strokeText: true,
			cssFontFamily: 'serif',
			area: { width, height},
			seed: 451,
			rounds: 10,}
			)
		
		hash1 = getHash(canvas1)
		hash2_1 = getHashFromURI(canvas1)
		
		// canvas2
		canvas2.width = `${width}`
		canvas2.height = `${height}`
		let context2 = canvas2.getContext('2d')
		
		paintCanvas({
			canvas2, 
			context2, 
			strokeText: true,
			cssFontFamily: 'serif',
			area: { width, height},
			seed: 451,
			rounds: 10,}
			)
		context2.clearRect(0, 0, width, height);
		//context2.drawImage(img, 0, 0, width, height)
		let id2 = context2.getImageData(0, 0, width, height)
		
		for (let i=0; i<data.length;i++){
			id2.data[i] = data[i]
		}
		context2.putImageData(id2, 0, 0)
		
		const dataURI2 = canvas2.toDataURL()
		hash2 = getHash(canvas2)
		hash2_2 = getHashFromURI(canvas2)
		
		
		// canvas3
		canvas3.width = `${width}`
		canvas3.height = `${height}`
		let ctx3 = canvas3.getContext('2d')
		ctx3.clearRect(0, 0, width, height);
		let imageData = canvas2.getContext('2d').getImageData(0, 0, width, height).data
		console.log('Idata:', imageData)
		
		// for (let x=0; x < width; x++) {
		// 	for (let y=0; y < height; y++) {
		// 		let i =(y*width+x)*4;
		// 		let pixel = [imageData[i], imageData[i+1], imageData[i+2], imageData[i+3]]
		// 		//console.log('Pixel: ', pixel)
		// 		const id = ctx3.createImageData(1, 1)
		// 		id.data[0] = pixel[0]
		// 		id.data[1] = pixel[1]
		// 		id.data[2] = pixel[2]
		// 		id.data[3] = pixel[3]
		// 		ctx3.putImageData(id, x, y)
		// 	}
		// }
		for (let x=0; x < width; x++) {
			for (let y=0; y < height; y++) {
				let i =(y*width+x)*4;
				let pixel = [data[i], data[i+1], data[i+2], data[i+3]]
				//console.log('Pixel: ', pixel)
				const id = ctx3.createImageData(1, 1)
				id.data[0] = pixel[0]
				id.data[1] = pixel[1]
				id.data[2] = pixel[2]
				id.data[3] = pixel[3]
				ctx3.putImageData(id, x, y)
			}
		}
		
		const dataURI3 = canvas3.toDataURL()
		hash3 = getHash(canvas3)
		hash2_3 = getHashFromURI(canvas3)

		
		
		//console.log(dataURI1)
		let ctx1 = canvas1.getContext('2d')
		let id1 = ctx1.getImageData(0, 0, width, height)
		let out = []
		for (let i=0;i<id1.data.length;i++){
			out.push(id1.data[i])
		}
		console.log(JSON.stringify(out))
		
		
	})
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<section>
  {#if hash3 === undefined }
    <h2>Loading...</h2>
  {:else if (hash3 !== hash2 || hash2 !== expected) }
    <h2 class='red'>Has Noise (canvas Data)</h2>
  {:else}
    <h2 class='green'>No Noise (canvas Data)</h2>
  {/if}
  
  {#if hash2_3 === undefined }
    <h2>Loading...</h2>
  {:else if (hash2_3 !== hash2_2 || hash2_2 !== expectedDataURL) }
    <h2 class='red'>
		Has Noise (toDataURL)
		{#if (hash3 !== hash2 || hash2 !== expected)}
		Octo/Brave
		{:else}
		Dolphin/Multilogin
		{/if}
	</h2>
  {:else}
    <h2 class='green'>No Noise (toDataURL)</h2>
  {/if}
  
  <div class='content'>
  <div class='cvs'>
  <h3>Canvas1: {hash1}</h3>
  <div class='exp'>Must be different in diffrent profiles</div>
  <div class='exp'>URI Hash: {hash2_1}</div>
  <canvas id='canvas1' bind:this={canvas1} />
  </div>
  <div class='cvs'>
  <h3>Canvas2: {hash2}</h3>
  <div class='exp'>Expected: {expected}</div>
  <div class='exp'>URI Hash: {hash2_2}</div>
  <canvas id='canvas2' bind:this={canvas2} />
  </div>
  
  <div class='cvs'>
  <h3>Canvas3: {hash3}</h3>
  <div class='exp'>Expected: {expected}</div>
  <div class='exp'>URI Hash: {hash2_3}</div>
  <canvas id='canvas3' bind:this={canvas3} />
  </div>
  </div>
</section>

<style>
	.content {
		flex: 1;
		flex-wrap: wrap;
		display: flex;
	}
	.cvs {
		margin-left: 10px;
	}
    h2 {
		text-align: center;
		font-size: 3rem;
	}
	h3,.exp {
		font-size: 0.7rem;
	}
    .green {
		color: green;
	}
	.red {
		color: red;
	}
    #canvas1,#canvas2,#canvas3 {
		border: 0.1rem solid;
		min-width: 500px;
		min-height: 300px;
	}
	

</style>
