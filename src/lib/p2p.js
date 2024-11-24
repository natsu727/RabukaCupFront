import { db } from "$lib/firebase/firebase.js";
import { setDoc, updateDoc, onSnapshot, doc, addDoc, collection, getDoc, getDocs } from "firebase/firestore";

const configuration = {
	iceServers: [
		{
			urls: [
				'stun:stun1.l.google.com:19302',
				'stun:stun2.l.google.com:19302',
				// 'turn:turn01.hubl.in?transport=udp',
			],

		},
		{
			url: 'turn:numb.viagenie.ca',
			credential: 'muazkh',
			username: 'webrtc@live.com'
		},

	],
	iceCandidatePoolSize: 10,
};

let dataSend;
let dataReceive;

let localStream = null;
let remoteStream = null;
let roomDialog = null;
let roomId = null;
let peerConnection;
let sendChannel;
let receiveChannel;


export async function sendData() {
	const data = dataSend.value;
	sendChannel.send(data);
	console.log('Sent Data: ' + data);
}

// export async function joinRoom() {
// 	roomId = document.querySelector('#room-id').value;
// 	document.querySelector(
// 		'#currentRoom').innerText = `Current room is ${roomId} - You are the callee!`;
// 	await joinRoomById(roomId);
// 	addInputLister();
// }

async function addInputLister() {
	dataSend.addEventListener('keyup', () => {
		 sendData();
	});
}

export async function createRoom() {

	peerConnection = new RTCPeerConnection(configuration);
	setSendChannel();

	const offer = await peerConnection.createOffer();
	await peerConnection.setLocalDescription(offer);
	const roomRef = await addDoc(collection(db, "rooms"), {"offer": offer});

	const callerCandidatesCollection = collection(roomRef, 'callerCandidates');
	peerConnection.onicecandidate = e => {
		if (!e.candidate) {
			console.log("Got final candidata!");
			return;
		}
		console.log("Got candidate: ", e.candidate);
		addDoc(callerCandidatesCollection, e.candidate.toJSON());
	}	


	const roomWithOffer = {
		offer: {
			type: offer.type,
			sdp: offer.sdp
		}
	}

	await updateDoc(roomRef, roomWithOffer);
	// await setDoc(roomRef, roomWithOffer);
	const roomId = roomRef.id;
	document.querySelector('#currentRoom')
		.innerText = `Current room is '${roomId}' - You are the caller!`

	onSnapshot(doc(db, "rooms", roomId), (snapshot) => {
		const data = snapshot.data();
		console.log(`data: ${data}`)
		if (!peerConnection.currentRemoteDescription && data.answer) {
			console.log('Got remote description: ', data.answer);
			const answer = new RTCSessionDescription(data.answer);
			const rtcSessionDescription = new RTCSessionDescription(data.answer);
			 peerConnection.setRemoteDescription(rtcSessionDescription);
		}
	});

	onSnapshot(collection(roomRef, 'calleeCandidates'), (snapshot) => {
		snapshot.docChanges().forEach(async change => {
			if (change.type == "added") {
				let data = change.doc.data();
				console.log('Got new remote ICE candidate: ', JSON.stringify(data));
				await peerConnection.addIceCandidate(new RTCIceCandidate(data));
			}
		});
	});

	addInputLister();
}

function setSendChannel() {
	dataSend = document.querySelector('#dataSend');
	dataReceive = document.querySelector('#dataReceive');

	// peerConnection = new RTCPeerConnection(configuration);
	sendChannel = peerConnection.createDataChannel('sendDataChannel');
	sendChannel.onopen = onSendChannelStateChange;
	sendChannel.onclose = onSendChannelStateChange;
	peerConnection.onicecandidate = e => {
		onIceCandidate(peerConnection, e);
	};

  	peerConnection.ondatachannel = receiveChannelCallback;


	console.log('Created local peer connection object peerConnection');
}


function gotDescription2(desc) {
	peerConnection.setLocalDescription(desc);
	console.log(`Answer from remoteConnection\n${desc.sdp}`);
	peerConnection.setRemoteDescription(desc);
}


export async function joinRoomById(roomId) {
	const roomRef = await doc(db, "rooms", roomId);
	const roomSnapshot = await getDoc(roomRef);
	console.log('Got room:', roomRef);
	

	if (roomSnapshot.exists()) {
		peerConnection = new RTCPeerConnection(configuration);
		setSendChannel();

		registerPeerConnectionListeners();

		const calleeCandidateCollections = collection(roomRef, "calleeCandidates");
		peerConnection.onicecandidate = e => {
			if (!e.candidate) {
				console.log('Got final candidate!');
				return;
			}
			console.log("Got candidate", e.candidate);
			addDoc(calleeCandidateCollections, e.candidate.toJSON());
		};

		const offer = roomSnapshot.data().offer;
		await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
		const answer = await peerConnection.createAnswer();
		await peerConnection.setLocalDescription(answer);

		const roomWithAnswer = {
			answer: {
				type: answer.type,
				sdp: answer.sdp
			}
		}
		await updateDoc(roomRef, roomWithAnswer);



		onSnapshot(collection(roomRef, 'callerCandidates'), (snapshot) => {
			snapshot.docChanges().forEach(async change => {
				if (change.type == "added") {
					let data = change.doc.data();
					console.log('Got new remote ICE candidate: ', JSON.stringify(data));
					await peerConnection.addIceCandidate(new RTCIceCandidate(data));
				}
			});
		});

	addInputLister();
	}
}

function getOtherPc(pc) {
	return peerConnection;
}

function getName(pc) {
	return (pc === peerConnection) ? 'localPeerConnection' : 'remotePeerConnection';
}

function onSendChannelStateChange() {
	const readyState = sendChannel.readyState;
	console.log('Send channel state is: ' + readyState);
	if (readyState === 'open') {
		dataSend.disabled = false;
		dataSend.focus();
		// sendButton.disabled = false;
		// closeButton.disabled = false;
	} else {
		dataSend.disabled = true;
		// sendButton.disabled = true;
		// closeButton.disabled = true;
	}
}

function onReceiveChannelStateChange() {
	const readyState = receiveChannel.readyState;
	console.log(`Receive channel state is: ${readyState}`);
}

function onCreateSessionDescriptionError(error) {
	console.log('Failed to create session description: ' + error.toString());
}

function onIceCandidate(pc, event) {
	getOtherPc(pc)
		.addIceCandidate(event.candidate)
		.then(
			onAddIceCandidateSuccess,
			onAddIceCandidateError);
}

function onAddIceCandidateSuccess() {
	console.log('AddIceCandidate success.');
}

function onAddIceCandidateError(error) {
	console.log(`Failed to add Ice Candidate: ${error.toString()}`);
}


function onReceiveMessageCallback(event) {
	console.log('Received Message', event.data);
	dataReceive.value = event.data;
}

function receiveChannelCallback(event) {
	console.log('Receive Channel Callback');
	receiveChannel = event.channel;
	receiveChannel.onmessage = onReceiveMessageCallback;
	receiveChannel.onopen = onReceiveChannelStateChange;
	receiveChannel.onclose = onReceiveChannelStateChange;
}

function registerPeerConnectionListeners() {
	peerConnection.addEventListener('icegatheringstatechange', () => {
		console.log(
			`ICE gathering state changed: ${peerConnection.iceGatheringState}`);
	});

	peerConnection.addEventListener('connectionstatechange', () => {
		console.log(`Connection state change: ${peerConnection.connectionState}`);
	});

	peerConnection.addEventListener('signalingstatechange', () => {
		console.log(`Signaling state change: ${peerConnection.signalingState}`);
	});

	peerConnection.addEventListener('iceconnectionstatechange ', () => {
		console.log(
			`ICE connection state change: ${peerConnection.iceConnectionState}`);
	});
}

