import React, { ReactNode, SyntheticEvent } from "react";
import { RouteComponentProps } from "react-router-dom";
import store from "../store";
import { download } from "../utils";

interface ErrorBoundaryState {
    error?: Error;
}
type ErrorBoundaryProps = RouteComponentProps<Record<string, string | undefined>>;

export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    state: Readonly<ErrorBoundaryState> = {};

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { error };
    }

    donwloadState = (e: SyntheticEvent): void => {
        download(store.getState() as unknown as Record<string, unknown>, 'initialState.json');
        e.preventDefault();
    }

    render(): JSX.Element | ReactNode {
        const { error } = this.state;

        if (error) {
            const githubUrlParams = {
                title: `Got error: ${error.message}`,
                body: [
                    `DESCRIBE HERE WHAT HAPPENED AND WHAT YOU EXPECTED TO HAPPEN`,
                    "\n\n\n\n\n",

                    `**Current url**: ${window.location.toString()}`,
                    `**Previous url**: ${document.referrer}`,
                    "\n",
                    `**Error type**: ${error?.name}`,
                    `**Error message**: ${error?.message}`,
                    "\n\n",
                    error?.stack
                ].join("\n")
            } as Record<string, string>;


            const githubUrl = `https://github.com/nurikk/z2m-frontend/issues/new?${new URLSearchParams(githubUrlParams).toString()}`
            return <div className="container">

                <h1 className="text-danger">Hello, you&apos;ve found a bug. Congratulations!</h1>
                <ol>
                    <li className="fs-1 lh-lg">Calm down</li>
                    <li className="fs-1 lh-lg"><a href="#" onClick={this.donwloadState}>Download this file</a></li>

                    <li className="fs-1 lh-lg"><a target="_blank" rel="noopener noreferrer" href={githubUrl}>Raise a github issue</a>, attach previously donwloaded file</li>
                    <li className="fs-1 lh-lg">Take a screenshot of this page and attach to the issue</li>
                </ol>
                <div>
                    <div>{error.name}</div>
                    <div>{error.message}</div>
                    <pre>{error.stack}</pre>
                </div>
            </div>

        }
        return this.props.children;
    }

    componentDidUpdate(prevProps: ErrorBoundaryProps): void {
        const { location: { pathname } } = this.props;
        const { location: { pathname: prevPathname } } = prevProps;
        if (prevPathname !== pathname) {
            this.setState({ error: undefined });
        }
    }
}

