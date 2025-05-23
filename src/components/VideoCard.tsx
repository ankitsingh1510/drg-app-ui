import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from "expo-speech-recognition";
import { BeatLoader } from "react-spinners";
import { RTCView, mediaDevices, RTCPeerConnection, RTCSessionDescription } from 'react-native-webrtc';

export default function VideoCard() {
    const [isMicOn, setIsMicOn] = useState(false);
    const [isCameraOn, setIsCameraOn] = useState(false);
    const [isInteractionOn, setIsInteractionOn] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
    const [sessionInfo, setSessionInfo] = useState(null);
    const [peerConnection, setPeerConnection] = useState(null);
    const [taskInput, setTaskInput] = useState('');
    const SERVER_URL = 'https://api.heygen.com';
    const API_KEY = 'NDMxMDhjYmI1ZTFlNDc3MTgzMzczMjZlM2Y2NDI1ZDQtMTcyNDE2ODE5OQ==';
    const VITE_DR_G_VOICE_ID = "05a17a3da31246e6848d05f179e1dd1d";
    const VITE_DR_G_AVATAR_ID = "d2ce61509f2a4fd9b361ebf340b97cb2";

    useEffect(() => {
        // Handle any side effects here
        const getMedia = async () => {
            try {
                const result = await mediaDevices.getUserMedia({ audio: true });
                console.log('Audio permissions granted:', result);
            } catch (error) {
                console.error('Error getting media permissions:', error);
            }
        };

        getMedia();
        console.log(isLoading);
        console.log(isConnected);
    }, []);

    useEffect(() => {
        console.log(transcript);
    }, [transcript]);

    function onMessage(event) {
        const message = event.data;
        console.log('Received message:', message);
    }

    const createNewSession = async () => {
        console.log('Creating new session... please wait');
        try {
            const response = await fetch(`${SERVER_URL}/v1/streaming.new`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Api-Key': API_KEY,
                    'version': "v2",
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
            console.log('Session info:', data.data);
            console.log('Session ID:', data.data.session_id);

            const { sdp: serverSdp, ice_servers2: iceServers } = data.data;
            const pc = new RTCPeerConnection({ iceServers }) as any; // Explicitly cast to any to bypass TypeScript errors

            setIsLoading(false);
            setIsConnected(true);
            setIsInteractionOn(true);

            setPeerConnection(pc);
            console.log('PeerConnection initialized:', pc);
            pc.ontrack = (event) => {
                console.log('ontrack event received:', event.track.kind);
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

            console.log('Session creation completed. Starting session... please wait');

            if (pc) {
                startAndDisplay(pc, data.data);
            } else {
                console.error('PeerConnection is not initialized.');
            }

            // setTimeout(() => {
            //     console.log('Starting session');
            //     if (pc) {
            //         startAndDisplay(pc, data.data);
            //     } else {
            //         console.error('PeerConnection is not initialized.');
            //     }
            // }, 10000);
        } catch (error) {
            console.error('Error creating or starting session:', error);
            console.log('Error creating or starting session.');
        }
    };

    const startSession = async (session_id, sdp) => {
        const response = await fetch(`${SERVER_URL}/v1/streaming.start`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Api-Key': API_KEY,
            },
            body: JSON.stringify({ session_id, sdp }),
        });
        if (response.status === 500) {
            console.error('Server error');
            console.log('Server Error. Please ask the staff if the service has been turned on');
            throw new Error('Server error');
        } else {
            const data = await response.json();
            return data.data;
        }
    }


    const startAndDisplay = async (pc, sessionInfo) => {
        try {
            console.log('starting session', pc);
            const localDescription = await pc.createAnswer();
            await pc.setLocalDescription(localDescription);
            console.log('localDescription', localDescription);
            pc.onicecandidate = ({ candidate }) => {
                console.log('Received ICE candidate:', candidate);
                if (candidate) {
                    handleICE(sessionInfo.session_id, candidate.toJSON());
                }
            };

            // When ICE connection state changes, display the new state
            pc.oniceconnectionstatechange = (event) => {
                console.log('ICE connection state change event:', event);
                console.log('ICE connection state:', pc);
                console.log(`ICE connection state changed to: ${pc.iceConnectionState}`);
            };

            await startSession(sessionInfo.session_id, localDescription);

            var receivers = peerConnection?.getReceivers();
            if (receivers && receivers.length > 0) {
                receivers.forEach((receiver) => {
                    receiver.jitterBufferTarget = 500
                });
            }
            console.log('Session started successfully');
            setTimeout(() => {
                console.log('Session started successfully');
                setTaskInput("Hi i am Dr.G");
                console.log('Sending task... please wait');
                repeatHandler();
            }, 5000);
        } catch (error) {
            console.error('Error starting session:', error);
        }
    }

    const handleICE = async (session_id, candidate) => {
        try {
            console.log('Sending ICE candidate:', candidate, session_id);
            const response = await fetch(`${SERVER_URL}/v1/streaming.ice`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Api-Key': API_KEY,
                },
                body: JSON.stringify({ session_id, candidate }),
            });
            console.log('ICE candidate response:', response);
            if (response.status === 500) {
                console.error('Server error');
                console.log('Server Error. Please ask the staff if the service has been turned on');
                throw new Error('Server error');
            } else {
                const data = await response.json();
                return data;
            }
        } catch (error) {
            console.error('Error handling ICE candidate:', error);
        }
    };

    const repeatHandler = async () => {
        console.log("repeatHandler", taskInput)
        if (!sessionInfo) {
            console.log('Please create a connection first');
            return;
        }

        if (!taskInput.trim()) {
            Alert.alert('Error', 'Please enter a task');
            return;
        }

        console.log('Sending task... please wait');

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
            console.log('Task sent successfully');
            if (response.status === 500) {
                throw new Error('Server error');
            } else {
                const data = await response.json();
                return data.data;
            }
        } catch (error) {
            console.error('Error sending task:', error);
            console.log('Error sending task.');
        }
    };

    useSpeechRecognitionEvent("result", (event) => {
        setTranscript(event.results[0]?.transcript || "");
    });

    useSpeechRecognitionEvent("start", () => { });
    useSpeechRecognitionEvent("end", () => { });
    useSpeechRecognitionEvent("error", (event) => {
        setTranscript("Error: " + event.message);
    });

    const toggleMic = async () => {
        if (isMicOn) {
            ExpoSpeechRecognitionModule.stop();
        } else {
            const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
            if (result.granted) {
                ExpoSpeechRecognitionModule.start({
                    lang: "en-US",
                    interimResults: true,
                    continuous: true,
                });
            } else {
                setTranscript("Permissions not granted");
            }
        }
        setIsMicOn((prev) => !prev);
    };

    const toggleCamera = () => {
        setIsCameraOn((prev) => !prev);
    };

    const startInteraction = () => {
        // setIsInteractionOn(true);
        // Add your call starting logic here
        setIsLoading(true);
        createNewSession();
        // setTimeout(() => {
        //     setIsLoading(false);
        //     setIsConnected(true);
        //     setIsInteractionOn(true);
        // }, 2000); // Simulate a delay for connection
    };

    const endInteraction = () => {
        setIsLoading(false);
        setIsConnected(false);
        setIsInteractionOn(false);
        // setIsInteractionOn(false);
        // Add your call ending logic here
    };

    return (
        <View className="flex-1 bg-[#dbeafe] relative">
            {/* Main content */}
            {(isLoading && !isConnected) ? (
                <View className="flex-1 justify-center items-center px-4">
                    <ActivityIndicator size="large" color="#ffffff" />
                </View>
            ) : (!isLoading && isConnected) ? (
                <View className="flex-1 justify-center items-center">
                    <RTCView
                        objectFit="cover"
                        streamURL={mediaStream?.toURL()}
                        style={{
                            width: '100%',
                            height: '100%',
                            flex: 1,
                        }}
                    />
                </View>
            ) : (
                <View className="flex-1 justify-center items-center px-4">
                    <View className="w-24 h-24 rounded-full bg-[#f4f4f5] justify-center items-center">
                        <Text className="text-[#5c7ac6] text-lg font-bold text-center">Dr.G</Text>
                    </View>
                </View>
            )}

            {/* Floating Control Buttons */}
            <View
                className="absolute bottom-1 w-full flex-row justify-center items-center space-x-4"
            >
                {/* Call Button */}
                {!isLoading && !isInteractionOn && !isConnected && (
                    <TouchableOpacity
                        onPress={startInteraction}
                        className="rounded-full p-2 bg-green-500"
                    >
                        <Ionicons name="call" size={16} color="white" />
                    </TouchableOpacity>
                )}

                {/* Interaction Buttons */}
                {!isLoading && isInteractionOn && isConnected && (
                    <>
                        {/* Camera Button */}
                        <TouchableOpacity
                            onPress={toggleCamera}
                            className="rounded-full p-3"
                            disabled={!isInteractionOn}
                        >
                            <Ionicons
                                name={isCameraOn ? "videocam" : "videocam-off"}
                                size={16}
                                color={isCameraOn ? "white" : "gray"}
                            />
                        </TouchableOpacity>

                        {/* End Call Button */}
                        <TouchableOpacity
                            onPress={endInteraction}
                            className="rounded-full p-2 bg-red-500"
                        >
                            <Ionicons name="call" size={16} color="white" />
                        </TouchableOpacity>

                        {/* Mic Button */}
                        <TouchableOpacity
                            onPress={toggleMic}
                            className="rounded-full p-3"
                            disabled={!isInteractionOn}
                        >
                            <Ionicons
                                name={isMicOn ? "mic" : "mic-off"}
                                size={16}
                                color={isMicOn ? "white" : "gray"}
                            />
                        </TouchableOpacity>
                    </>
                )}
            </View>
        </View>
    );
}
