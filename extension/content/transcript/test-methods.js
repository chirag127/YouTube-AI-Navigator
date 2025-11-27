/**
 * Test Suite for Transcript Extraction Methods
 *
 * This file provides utilities to test all transcript extraction methods
 * and verify they work correctly.
 *
 * Usage in browser console:
 * 1. Navigate to a YouTube video
 * 2. Open developer console
 * 3. Run: testAllMethods('VIDEO_ID')
 */

import transcriptExtractor from './extractor.js'
import transcriptInterceptor from './xhr-interceptor.js'
import { TranscriptService } from './service.js'

/**
 * Test all extraction methods
 */
export async function testAllMethods(videoId, lang = 'en') {
    console.log('='.repeat(80))
    console.log('TRANSCRIPT EXTRACTION METHODS TEST')
    console.log('='.repeat(80))
    console.log(`Video ID: ${videoId}`)
    console.log(`Language: ${lang}`)
    console.log('='.repeat(80))

    const results = {
        interceptor: null,
        invidious: null,
        youtube: null,
        background: null,
        dom: null
    }

    const methods = [
        { name: 'interceptor', label: 'XHR Interceptor' },
        { name: 'invidious', label: 'Invidious API' },
        { name: 'youtube', label: 'YouTube Direct API' },
        { name: 'background', label: 'Background Proxy' },
        { name: 'dom', label: 'DOM Parser' }
    ]

    for (const method of methods) {
        console.log(`\n${'─'.repeat(80)}`)
        console.log(`Testing: ${method.label}`)
        console.log('─'.repeat(80))

        try {
            const startTime = performance.now()

            const transcript = await transcriptExtractor._extractWithMethod(
                method.name,
                videoId,
                lang,
                15000 // 15 second timeout
            )

            const duration = (performance.now() - startTime).toFixed(2)

            if (transcript && transcript.length > 0) {
                results[method.name] = {
                    success: true,
                    segments: transcript.length,
                    duration: `${duration}ms`,
                    firstSegment: transcript[0],
                    lastSegment: transcript[transcript.length - 1]
                }

                console.log(`✅ SUCCESS`)
                console.log(`   Segments: ${transcript.length}`)
                console.log(`   Duration: ${duration}ms`)
                console.log(`   First: "${transcript[0].text.substring(0, 50)}..."`)
                console.log(`   Last: "${transcript[transcript.length - 1].text.substring(0, 50)}..."`)
            } else {
                results[method.name] = {
                    success: false,
                    error: 'Empty result'
                }
                console.log(`⚠️ EMPTY RESULT`)
            }
        } catch (error) {
            results[method.name] = {
                success: false,
                error: error.message
            }
            console.log(`❌ FAILED: ${error.message}`)
        }
    }

    // Print summary
    console.log('\n' + '='.repeat(80))
    console.log('TEST SUMMARY')
    console.log('='.repeat(80))

    const successCount = Object.values(results).filter(r => r?.success).length
    const totalCount = Object.keys(results).length

    console.log(`\nSuccess Rate: ${successCount}/${totalCount} (${((successCount / totalCount) * 100).toFixed(1)}%)`)
    console.log('\nResults:')

    for (const [method, result] of Object.entries(results)) {
        const status = result?.success ? '✅' : '❌'
        const label = methods.find(m => m.name === method)?.label || method

        if (result?.success) {
            console.log(`${status} ${label}: ${result.segments} segments in ${result.duration}`)
        } else {
            console.log(`${status} ${label}: ${result?.error || 'Unknown error'}`)
        }
    }

    console.log('\n' + '='.repeat(80))

    return results
}

/**
 * Test specific method
 */
export async function testMethod(methodName, videoId, lang = 'en') {
    console.log(`Testing ${methodName} for video ${videoId}...`)

    try {
        const startTime = performance.now()
        const transcript = await transcriptExtractor._extractWithMethod(
            methodName,
            videoId,
            lang,
            15000
        )
        const duration = (performance.now() - startTime).toFixed(2)

        console.log(`✅ Success: ${transcript.length} segments in ${duration}ms`)
        console.log('First segment:', transcript[0])
        console.log('Last segment:', transcript[transcript.length - 1])

        return transcript
    } catch (error) {
        console.error(`❌ Failed: ${error.message}`)
        throw error
    }
}

/**
 * Compare all methods
 */
export async function compareMethods(videoId, lang = 'en') {
    console.log('Comparing all methods...\n')

    const results = await testAllMethods(videoId, lang)

    // Find fastest method
    const successfulMethods = Object.entries(results)
        .filter(([_, result]) => result?.success)
        .map(([name, result]) => ({
            name,
            duration: parseFloat(result.duration),
            segments: result.segments
        }))
        .sort((a, b) => a.duration - b.duration)

    if (successfulMethods.length > 0) {
        console.log('\n🏆 Performance Ranking:')
        successfulMethods.forEach((method, index) => {
            console.log(`${index + 1}. ${method.name}: ${method.duration}ms (${method.segments} segments)`)
        })

        console.log(`\n⚡ Fastest: ${successfulMethods[0].name} (${successfulMethods[0].duration}ms)`)
    }

    return results
}

/**
 * Test interceptor status
 */
export function testInterceptor() {
    console.log('Testing XHR Interceptor...\n')

    const stats = transcriptInterceptor.getStats()
    console.log('Interceptor Stats:', stats)

    if (stats.isInitialized) {
        console.log('✅ Interceptor is initialized')
        console.log(`   Transcripts cached: ${stats.transcripts}`)
        console.log(`   Metadata cached: ${stats.metadata}`)
    } else {
        console.log('❌ Interceptor is not initialized')
        console.log('   Run: transcriptInterceptor.init()')
    }

    return stats
}

/**
 * Test available captions
 */
export function testAvailableCaptions() {
    console.log('Testing available captions...\n')

    const languages = transcriptExtractor.getAvailableLanguages()
    const hasCaptions = transcriptExtractor.hasCaptions()

    console.log(`Has captions: ${hasCaptions}`)
    console.log(`Available languages: ${languages.length}`)

    if (languages.length > 0) {
        console.log('\nLanguages:')
        languages.forEach(lang => {
            console.log(`  - ${lang.name} (${lang.code}) [${lang.kind}]`)
        })
    }

    return { hasCaptions, languages }
}

/**
 * Benchmark extraction speed
 */
export async function benchmarkExtraction(videoId, iterations = 5) {
    console.log(`Benchmarking extraction (${iterations} iterations)...\n`)

    const times = []

    for (let i = 0; i < iterations; i++) {
        console.log(`Iteration ${i + 1}/${iterations}...`)

        // Clear cache to ensure fair test
        transcriptExtractor.clearCache()

        const startTime = performance.now()
        await transcriptExtractor.extract(videoId)
        const duration = performance.now() - startTime

        times.push(duration)
        console.log(`  Time: ${duration.toFixed(2)}ms`)
    }

    const avg = times.reduce((a, b) => a + b, 0) / times.length
    const min = Math.min(...times)
    const max = Math.max(...times)

    console.log('\nResults:')
    console.log(`  Average: ${avg.toFixed(2)}ms`)
    console.log(`  Min: ${min.toFixed(2)}ms`)
    console.log(`  Max: ${max.toFixed(2)}ms`)

    return { times, avg, min, max }
}

/**
 * Test error handling
 */
export async function testErrorHandling() {
    console.log('Testing error handling...\n')

    const tests = [
        {
            name: 'Invalid video ID',
            videoId: 'INVALID_ID_12345',
            shouldFail: true
        },
        {
            name: 'Invalid language',
            videoId: 'dQw4w9WgXcQ',
            lang: 'xx',
            shouldFail: false // Should fallback to available language
        },
        {
            name: 'Empty video ID',
            videoId: '',
            shouldFail: true
        }
    ]

    const results = []

    for (const test of tests) {
        console.log(`Testing: ${test.name}`)

        try {
            await transcriptExtractor.extract(test.videoId, { lang: test.lang || 'en' })

            if (test.shouldFail) {
                console.log('  ❌ Should have failed but succeeded')
                results.push({ ...test, result: 'unexpected_success' })
            } else {
                console.log('  ✅ Succeeded as expected')
                results.push({ ...test, result: 'success' })
            }
        } catch (error) {
            if (test.shouldFail) {
                console.log(`  ✅ Failed as expected: ${error.message}`)
                results.push({ ...test, result: 'expected_failure', error: error.message })
            } else {
                console.log(`  ❌ Unexpected failure: ${error.message}`)
                results.push({ ...test, result: 'unexpected_failure', error: error.message })
            }
        }
    }

    return results
}

/**
 * Run all tests
 */
export async function runAllTests(videoId) {
    console.log('\n' + '█'.repeat(80))
    console.log('RUNNING ALL TESTS')
    console.log('█'.repeat(80) + '\n')

    const results = {}

    // Test 1: Available captions
    console.log('\n📋 Test 1: Available Captions')
    results.captions = testAvailableCaptions()

    // Test 2: Interceptor status
    console.log('\n🔍 Test 2: Interceptor Status')
    results.interceptor = testInterceptor()

    // Test 3: All methods
    console.log('\n🧪 Test 3: All Extraction Methods')
    results.methods = await testAllMethods(videoId)

    // Test 4: Performance comparison
    console.log('\n⚡ Test 4: Performance Comparison')
    results.comparison = await compareMethods(videoId)

    // Test 5: Error handling
    console.log('\n🛡️ Test 5: Error Handling')
    results.errors = await testErrorHandling()

    console.log('\n' + '█'.repeat(80))
    console.log('ALL TESTS COMPLETE')
    console.log('█'.repeat(80) + '\n')

    return results
}

// Make functions available globally for console testing
if (typeof window !== 'undefined') {
    window.transcriptTests = {
        testAllMethods,
        testMethod,
        compareMethods,
        testInterceptor,
        testAvailableCaptions,
        benchmarkExtraction,
        testErrorHandling,
        runAllTests
    }

    console.log('Transcript test utilities loaded!')
    console.log('Available functions:')
    console.log('  - transcriptTests.testAllMethods(videoId)')
    console.log('  - transcriptTests.testMethod(methodName, videoId)')
    console.log('  - transcriptTests.compareMethods(videoId)')
    console.log('  - transcriptTests.testInterceptor()')
    console.log('  - transcriptTests.testAvailableCaptions()')
    console.log('  - transcriptTests.benchmarkExtraction(videoId)')
    console.log('  - transcriptTests.testErrorHandling()')
    console.log('  - transcriptTests.runAllTests(videoId)')
}

export default {
    testAllMethods,
    testMethod,
    compareMethods,
    testInterceptor,
    testAvailableCaptions,
    benchmarkExtraction,
    testErrorHandling,
    runAllTests
}
