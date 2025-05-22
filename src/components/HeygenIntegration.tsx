import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Button, TextInput, Alert, StyleSheet } from 'react-native';
import { RTCView, mediaDevices, RTCPeerConnection, RTCSessionDescription } from 'react-native-webrtc';

const HeygenIntegration = () => {
    const [status, setStatus] = useState('Please click the new button to create the stream first.');
    const [sessionInfo, setSessionInfo] = useState(null);
    const [peerConnection, setPeerConnection] = useState(null);
    const [taskInput, setTaskInput] = useState('');
    const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

    const SERVER_URL = 'https://api.heygen.com';
    const API_KEY = 'NDMxMDhjYmI1ZTFlNDc3MTgzMzczMjZlM2Y2NDI1ZDQtMTcyNDE2ODE5OQ==';
    const VITE_DR_G_VOICE_ID = "05a17a3da31246e6848d05f179e1dd1d";
    const VITE_DR_G_AVATAR_ID = "d2ce61509f2a4fd9b361ebf340b97cb2";
    const updateStatus = (message) => {
        setStatus((prev) => `${prev}\n${message}`);
    };

    function onMessage(event) {
        const message = event.data;
        console.log('Received message:', message);
    }

    const createNewSession = async () => {
        updateStatus('Creating new session... please wait');
        try {
            const response = await fetch(`${SERVER_URL}/v1/streaming.new`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Api-Key': API_KEY,
                },
                body: JSON.stringify({
                    video_encoding: "H264",
                    quality: 'low',
                    avatar_name: VITE_DR_G_AVATAR_ID,
                    voice: { voice_id: VITE_DR_G_VOICE_ID },
                }),
            });

            if (response.status === 500) {
                throw new Error('Server error');
            }

            const data = await response.json();
            setSessionInfo(data.data);

            const { sdp: serverSdp, ice_servers2: iceServers } = data.data;
            const pc = new RTCPeerConnection({ iceServers }) as any; // Explicitly cast to any to bypass TypeScript errors
            setPeerConnection(pc);
            pc.ontrack = (event) => {
                console.log('ontrack event received:', event.track.kind);

                // if (event.streams && event.streams[0]) {
                //     console.log("123456", event);
                //     setMediaStream(event.streams[0]);
                // }
                if (event.track.kind === 'audio' || event.track.kind === 'video') {
                    setMediaStream(event.streams[0]);
                }
            };

            pc.ondatachannel = (event) => {
                const dataChannel = event.channel;
                dataChannel.onmessage = onMessage;
            };

            const remoteDescription = new RTCSessionDescription(serverSdp);
            await pc.setRemoteDescription(remoteDescription);

            updateStatus('Session creation completed. Starting session... please wait');

            setTimeout(() => {
                console.log('Starting session');
                startAndDisplay();
            }, 10000);
        } catch (error) {
            console.error('Error creating or starting session:', error);
            updateStatus('Error creating or starting session.');
        }
    };

    const startAndDisplay = async () => {
        try {
            console.log('starting session');
            const localDescription = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(localDescription);
            console.log('localDescription', localDescription);
            peerConnection.onicecandidate = ({ candidate }) => {
                console.log('Received ICE candidate:', candidate);
                if (candidate) {
                    handleICE(sessionInfo.session_id, candidate.toJSON());
                }
            };

            // When ICE connection state changes, display the new state
            peerConnection.oniceconnectionstatechange = (event) => {
                console.log(`ICE connection state changed to: ${peerConnection.iceConnectionState}`);
            };
        } catch (error) {
            console.error('Error starting session:', error);
        }
    }

    const handleICE = async (session_id, candidate) => {
        try {
            await fetch(`${SERVER_URL}/v1/streaming.ice`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Api-Key': API_KEY,
                },
                body: JSON.stringify({ session_id, candidate }),
            });
        } catch (error) {
            console.error('Error handling ICE candidate:', error);
        }
    };

    const repeatHandler = async () => {
        console.log("repeatHandler", taskInput)
        if (!sessionInfo) {
            updateStatus('Please create a connection first');
            return;
        }

        if (!taskInput.trim()) {
            Alert.alert('Error', 'Please enter a task');
            return;
        }

        updateStatus('Sending task... please wait');

        try {
            const response = await fetch(`${SERVER_URL}/v1/streaming.task`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Api-Key': API_KEY,
                },
                body: JSON.stringify({ session_id: sessionInfo.session_id, text: taskInput }),
            });
            console.log(response);
            if (response.status === 500) {
                throw new Error('Server error');
            }

            updateStatus('Task sent successfully');
        } catch (error) {
            console.error('Error sending task:', error);
            updateStatus('Error sending task.');
        }
    };
    useEffect(() => {
        if (mediaStream) {
            console.log('Media stream details:', {
                id: mediaStream._id,
                active: mediaStream.active,
                trackCount: mediaStream._tracks?.length || 0
            });

            // Check if there are tracks in the stream
            if (mediaStream._tracks && mediaStream._tracks.length > 0) {
                mediaStream._tracks.forEach(track => {
                    console.log(`Track ${track.id}:`, {
                        kind: track.kind,
                        readyState: track._readyState,
                        enabled: track._enabled,
                        muted: track._muted
                    });
                });
            } else {
                console.warn('No tracks found in the media stream');
            }
        }
    }, [mediaStream]);



    return (
        <View style={styles.container}>
            <Text style={styles.status}>{status}</Text>
            <Button title="New Session" onPress={createNewSession} />
            <TextInput
                style={styles.input}
                placeholder="Enter task"
                value={taskInput}
                onChangeText={setTaskInput}
            />
            <Button title="Send Task" onPress={repeatHandler} />
            <RTCView
                objectFit='cover'
                streamURL={mediaStream?.toURL()}
                style={styles.video}
                zOrder={1}
            />

        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#fff',
    },
    status: {
        marginBottom: 16,
        color: '#333',
    },
    noVideoContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
    }
    ,
    input: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        marginBottom: 16,
        paddingHorizontal: 8,
    },
    video: {
        width: '100%',
        height: 200,
    },
});

export default HeygenIntegration;
