import React, { useState, useRef } from 'react';
import { View, Text, Button, TextInput, Alert, StyleSheet } from 'react-native';
import { RTCView, mediaDevices, RTCPeerConnection, RTCSessionDescription } from 'react-native-webrtc';

const HeygenIntegration = () => {
    const [status, setStatus] = useState('Please click the new button to create the stream first.');
    const [sessionInfo, setSessionInfo] = useState(null);
    const [peerConnection, setPeerConnection] = useState(null);
    const [taskInput, setTaskInput] = useState('');
    const [mediaStream, setMediaStream] = useState(null);

    const SERVER_URL = 'https://api.heygen.com';
    const API_KEY = 'NDMxMDhjYmI1ZTFlNDc3MTgzMzczMjZlM2Y2NDI1ZDQtMTcyNDE2ODE5OQ==';
    const VITE_DR_G_VOICE_ID = "05a17a3da31246e6848d05f179e1dd1d";
    const VITE_DR_G_AVATAR_ID = "d2ce61509f2a4fd9b361ebf340b97cb2";
    const updateStatus = (message) => {
        setStatus((prev) => `${prev}\n${message}`);
    };

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
            const pc = new RTCPeerConnection({ iceServers });

            pc.ontrack = (event) => {
                console.log("ABCevent", event);
                if (event.streams && event.streams[0]) {
                    console.log("123456", event);
                    setMediaStream(event.streams[0]);
                }
            };

            pc.onicecandidate = ({ candidate }) => {
                console.log("ABC", candidate);
                if (candidate) {
                    handleICE(data.data.session_id, candidate.toJSON());
                }
            };

            const remoteDescription = new RTCSessionDescription(serverSdp);
            await pc.setRemoteDescription(remoteDescription);

            setPeerConnection(pc);
            updateStatus('Session creation completed. Starting session... please wait');

            // Automatically start the session
            const localDescription = await pc.createAnswer();
            await pc.setLocalDescription(localDescription);

            await fetch(`${SERVER_URL}/v1/streaming.start`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Api-Key': API_KEY,
                },
                body: JSON.stringify({
                    session_id: data.data.session_id,
                    sdp: localDescription.sdp,
                }),
            });

            updateStatus('Session started successfully');
        } catch (error) {
            console.error('Error creating or starting session:', error);
            updateStatus('Error creating or starting session.');
        }
    };

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
            {mediaStream && <RTCView streamURL={mediaStream.toURL()} style={styles.video} />}
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
        backgroundColor: '#000',
    },
});

export default HeygenIntegration;
