import React, { useEffect } from 'react';
import { Helmet } from "react-helmet";

/**
 * Gather the ReCAPTCHA secret
 */
const maybeRecaptchaSite: string | undefined = process.env.RECAPTCHA_SITE;
const getRcSecret = (): string => {
	if (maybeRecaptchaSite && (maybeRecaptchaSite.length > 0)) {
		return maybeRecaptchaSite;
	}
	else {
		throw new Error('ReCaptcha secret is undefined.');
	}
}
const recaptchaSecret: string = getRcSecret();

/**
 * The Google ReCAPTCHA script includes the `grecaptcha` object
 */
export interface GrecaptchaV3 {
	ready: (cb: () => void) => void
	execute: (key: string, action: { action: string } | undefined) => Promise<string>
}

/**
 * Create the ReCAPTCHA script element
 */
const makeScriptSrc = (key: string): string => 'https://www.google.com/recaptcha/api.js?render=' + key;
export const LoadReCaptcha = () => (<Helmet>
	<script src={ makeScriptSrc(recaptchaSecret) } async={true} defer={true}/>
</Helmet>);

export type ExecuteRecaptcha = (action?: string) => Promise<string>;

export const RunReCaptcha = ({ action }:{ action: string }): JSX.Element => {
	const windowGlobal = typeof window !== 'undefined' && window;
	const _gcpta: GrecaptchaV3 | null = windowGlobal ? (windowGlobal as any).grecaptcha : null;

	const runReCaptcha = (action?: string | undefined): Promise<string> => {
		const promise: Promise<string> = new Promise<string>((resolve, reject) => {
			if (_gcpta) {
				_gcpta.ready(() => {
					_gcpta.execute(recaptchaSecret, action ? { action: action } : undefined).then((token: string) => {
						resolve(token);
					}).catch((reason: any) => reject(reason));
				});
			}
			else {
				reject('ReCAPTCHA is not loaded. Please reload the page and try again.');
			}
		});
		return promise;
	}

	useEffect(() => {
		runReCaptcha(action);
	}, []);

	// Render an empty div
	return <></>;
}

export const runReCaptcha = (action?: string | undefined): Promise<string> => {
	const windowGlobal = typeof window !== 'undefined' && window;
	const _gcpta: GrecaptchaV3 | null = windowGlobal ? (windowGlobal as any).grecaptcha : null;

	const promise: Promise<string> = new Promise<string>((resolve, reject) => {
		if (_gcpta) {
			_gcpta.ready(() => {
				_gcpta.execute(recaptchaSecret, action ? { action } : undefined).then((token: string) => {
					return resolve(token);
				}).catch((reason: any) => {
					return reject(reason);
				})
			});
		}
		else {
			return reject('ReCAPTCHA is not loaded. Please reload the page and try again.');
		}
	});

	return promise;
}