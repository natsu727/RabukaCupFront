import { db } from "$lib/server/firebase.js";

const configuration = {
	iceServers: [
		{
			urls: [
				'stun:stun1.l.google.com:19302',
				'stun:stun2.l.google.com:19302',
			],
		},
	],
	iceCandidatePoolSize: 10,
};

let peerConnection = null;
let localStream = null;
let remoteStream = null;
let roomDialog = null;
let roomId = null;

export async function startP2p() {
	await createRoom();
}

async function createRoom() {
	peerConnection = new RTCPeerConnection(configuration);
	registerPeerConnectionListeners();

	const offer = await peerConnection.createOffer();
	await peerConnection.setLocalDescription(offer);

	const roomWithOffer = {
		offer: {
			type: offer.type,
			sdp: offer.sdp
		}
	}

	const roomRef = await db.collection('rooms').add(roomWithOffer);
	const roomId = roomRef.id;
	document.querySelector('#currentRoom')
		.innerText = `Current room is '${roomId}' - You are the caller!`

	localStream.getTracks().forEach(track => {
		peerConnection.addTrack(track, localStream);
	});

	roomRef.onSnapshot(async (snapshot) => {
		console.log('Got updated room:', snapshot.data());
		const data = snapshot.data();
		if (!peerConnection.currentRemoteDescription && data.answer) {
			console.log('Set remote description: ', data.answer);
			const answer = new RTCSessionDescription(data.answer)
			await peerConnection.setRemoteDescription(answer);
		}
	});
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
