// Transcript service error classes

export class TranscriptError extends Error {
    constructor(message) {
        super(message);
        this.name = 'TranscriptError';
    }
}

export class NoCaptionsError extends TranscriptError {
    constructor() {
        super('No captions available for this video');
        this.name = 'NoCaptionsError';
    }
}

export class FetchError extends TranscriptError {
    constructor(status) {
        super(`Failed to fetch transcript: ${status}`);
        this.name = 'FetchError';
        this.status = status;
    }
}

export class ParseError extends TranscriptError {
    constructor(message) {
        super(`Failed to parse transcript: ${message}`);
        this.name = 'ParseError';
    }
}
