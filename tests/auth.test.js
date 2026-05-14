import { describe, it, expect, vi, beforeEach } from 'vitest';
import { JSDOM } from 'jsdom';

describe('Authentication Flow Logic', () => {
    let dom;
    let window;
    let document;

    beforeEach(() => {
        dom = new JSDOM('<!DOCTYPE html><html><body><div id="nameField" class="hidden"></div><button id="submitBtn" class="auth-btn"><i id="btnIcon" data-lucide="log-in"></i><span id="btnText">Sign In</span></button><div id="authFeedback" class="auth-feedback"></div></body></html>');
        window = dom.window;
        document = window.document;
        global.document = document;
        global.window = window;
    });

    it('should identify sign-in mode correctly', () => {
        const btnText = document.getElementById('btnText').textContent;
        const isSignUp = btnText.toLowerCase().includes('create');
        expect(isSignUp).toBe(false);
    });

    it('should identify sign-up mode correctly when button text changes', () => {
        document.getElementById('btnText').textContent = 'Create Account';
        const btnText = document.getElementById('btnText').textContent;
        const isSignUp = btnText.toLowerCase().includes('create');
        expect(isSignUp).toBe(true);
    });

    it('should have correct redirection paths', () => {
        const paths = {
            payment: '/payment',
            portal: '/frontend/portal.html',
            home: '/index.html'
        };
        expect(paths.payment).toBe('/payment');
        expect(paths.home).toBe('/index.html');
    });
});
