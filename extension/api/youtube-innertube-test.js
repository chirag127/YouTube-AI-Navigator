// YouTube.js InnerTube Integration Test
// Run this in browser console on a YouTube video page

(async () => {
    const { getClient, getVideoInfo, getComments } = await import(chrome.runtime.getURL('api/youtube-innertube.js'));
    const { fetchMetadata } = await import(chrome.runtime.getURL('services/video/innertube-metadata.js'));
    const { fetchComments } = await import(chrome.runtime.getURL('services/comments/innertube-comments.js'));
    const { fetchTranscript } = await import(chrome.runtime.getURL('services/transcript/fetcher.js'));

    const videoId = new URLSearchParams(window.location.search).get('v');

    console.log('🧪 Testing YouTube.js InnerTube Integration...');
    console.log(`📹 Video ID: ${videoId}`);

    try {
        // Test 1: Client Initialization
        console.log('\n1️⃣ Testing client initialization...');
        const client = await getClient();
        console.log('✅ Client initialized:', client);

        // Test 2: Metadata
        console.log('\n2️⃣ Testing metadata fetch...');
        const metadata = await fetchMetadata(videoId);
        console.log('✅ Metadata:', metadata);

        // Test 3: Transcript
        console.log('\n3️⃣ Testing transcript fetch...');
        const transcript = await fetchTranscript(videoId, 'en');
        console.log(`✅ Transcript: ${transcript.length} segments`);
        console.log('Sample:', transcript.slice(0, 3));

        // Test 4: Comments
        console.log('\n4️⃣ Testing comments fetch...');
        const comments = await fetchComments(videoId, 5);
        console.log(`✅ Comments: ${comments.length} items`);
        console.log('Sample:', comments[0]);

        console.log('\n🎉 All tests passed!');

    } catch (e) {
        console.error('❌ Test failed:', e);
    }
})();
