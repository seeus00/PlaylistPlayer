import { createSlice } from '@reduxjs/toolkit';

export const AudioSlice = createSlice({
    name: "Audio",
    initialState: {
        videos: [],
        currVideo: null,

        currAudioSrc: null,
        currAudioTime: 0,
        currAudioDuration: 0,

        currVideoId: null,

        currVolumeLevel: 0.2
    },
    
    reducers: {
        setVideos: (state, action) => {
            state.videos = action.payload;
        },

        setCurrVideo: (state, action) => {
            state.currVideo = action.payload;
        },

        setCurrAudioSrc: (state, action) => {
            state.currAudioSrc = action.payload;
        },

        setCurrAudioTime: (state, action) => {
            state.currAudioTime = action.payload;
        },

        setCurrAudioDuration: (state, action) => {
            state.currAudioDuration = action.payload;
        },
        
        setCurrVolumeLevel: (state, action) => {
            state.currVolumeLevel = action.payload;
        },

        setCurrVideoId: (state, action) => {
            state.currVideoId = action.payload;
        }
    }
})

export const { setVideos, setCurrAudioSrc, setCurrAudioTime, setCurrAudioDuration, setCurrVolumeLevel, 
    setCurrVideo, setCurrVideoId } = AudioSlice.actions;
export default AudioSlice.reducer;