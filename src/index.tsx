import React, { useEffect, useCallback } from 'react';
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
declare namespace GrecaptchaV3 {
	interface Grecaptcha {
		ready: (cb: () => void) => void
		execute: (key: string, action: { action: string }) => Promise<string>
	}
}
declare const grecaptcha: GrecaptchaV3.Grecaptcha;

/**
 * Create the ReCAPTCHA script element
 */
const makeScriptSrc = (key: string): string => 'https://www.google.com/recaptcha/api.js?render=' + key;
export const LoadReCaptcha = () => (<Helmet>
	<script src={ makeScriptSrc(recaptchaSecret) } async={true} defer={true}/>
</Helmet>);

export type ExecuteRecaptcha = (action?: string) => Promise<string>;

export const runReCaptcha = (execute: (executeRecaptcha: ExecuteRecaptcha) => void): void => {
	let _grecaptcha = grecaptcha ? grecaptcha : null;
	if (_grecaptcha) {
		_grecaptcha.ready(() => {
			const executeRecaptcha: ExecuteRecaptcha = (action: string) => (_grecaptcha as GrecaptchaV3.Grecaptcha).execute(recaptchaSecret, { action: action });
			return execute(executeRecaptcha);
		})
	}
	else {
		throw new Error('grecaptcha is not available.');
	}
}

export const RunReCaptchaOnComponentLoad = ({ action }:{ action: string}): JSX.Element => {
	useEffect(() => {
		runReCaptcha((executeRecaptcha) => {
			const memoizedCallback: ExecuteRecaptcha = useCallback(executeRecaptcha, [action]);
			return memoizedCallback(action);
		});
	}, []);

	// Render an empty div
	return <></>;
}