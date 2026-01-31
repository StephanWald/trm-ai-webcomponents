import { isYouTubeUrl, extractVideoId } from './youtube-wrapper';

describe('YouTube Helper Functions', () => {
  describe('isYouTubeUrl', () => {
    it('returns true for standard youtube.com/watch URL', () => {
      expect(isYouTubeUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe(true);
    });

    it('returns true for youtu.be short URL', () => {
      expect(isYouTubeUrl('https://youtu.be/dQw4w9WgXcQ')).toBe(true);
    });

    it('returns true for youtube.com/embed URL', () => {
      expect(isYouTubeUrl('https://www.youtube.com/embed/dQw4w9WgXcQ')).toBe(true);
    });

    it('returns true for youtube.com/watch with additional parameters', () => {
      expect(isYouTubeUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=10s')).toBe(true);
    });

    it('returns true for HTTP URLs', () => {
      expect(isYouTubeUrl('http://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe(true);
    });

    it('returns false for non-YouTube URLs', () => {
      expect(isYouTubeUrl('https://vimeo.com/123456')).toBe(false);
      expect(isYouTubeUrl('https://example.com/video.mp4')).toBe(false);
      expect(isYouTubeUrl('https://www.google.com')).toBe(false);
    });

    it('returns false for empty string', () => {
      expect(isYouTubeUrl('')).toBe(false);
    });

    it('returns false for invalid URL format', () => {
      expect(isYouTubeUrl('not a url')).toBe(false);
    });
  });

  describe('extractVideoId', () => {
    it('extracts video ID from youtube.com/watch URL', () => {
      const id = extractVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
      expect(id).toBe('dQw4w9WgXcQ');
    });

    it('extracts video ID from youtu.be short URL', () => {
      const id = extractVideoId('https://youtu.be/dQw4w9WgXcQ');
      expect(id).toBe('dQw4w9WgXcQ');
    });

    it('extracts video ID from youtube.com/embed URL', () => {
      const id = extractVideoId('https://www.youtube.com/embed/dQw4w9WgXcQ');
      expect(id).toBe('dQw4w9WgXcQ');
    });

    it('extracts video ID with additional query parameters', () => {
      const id = extractVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=10s&list=xyz');
      expect(id).toBe('dQw4w9WgXcQ');
    });

    it('extracts video ID from youtu.be with query params', () => {
      const id = extractVideoId('https://youtu.be/dQw4w9WgXcQ?t=10');
      expect(id).toBe('dQw4w9WgXcQ');
    });

    it('extracts video ID from embed with query params', () => {
      const id = extractVideoId('https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1');
      expect(id).toBe('dQw4w9WgXcQ');
    });

    it('returns null for non-YouTube URL', () => {
      const id = extractVideoId('https://vimeo.com/123456');
      expect(id).toBeNull();
    });

    it('returns null for malformed YouTube URL', () => {
      const id = extractVideoId('https://www.youtube.com/notvalid');
      expect(id).toBeNull();
    });

    it('returns null for empty string', () => {
      const id = extractVideoId('');
      expect(id).toBeNull();
    });

    it('handles YouTube URLs without protocol', () => {
      const id = extractVideoId('www.youtube.com/watch?v=dQw4w9WgXcQ');
      expect(id).toBe('dQw4w9WgXcQ');
    });

    it('handles youtu.be URLs without protocol', () => {
      const id = extractVideoId('youtu.be/dQw4w9WgXcQ');
      expect(id).toBe('dQw4w9WgXcQ');
    });
  });
});
