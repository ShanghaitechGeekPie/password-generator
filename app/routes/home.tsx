import type { Route } from "./+types/home";
import PasswordTool from "../pwd/tool";

export function meta({}: Route.MetaArgs) {
	return [
		{ title: "GeekPie_ Password Generator" },
		{ name: "description", content: "根据口令生成密码" },
	];
}

export function loader({ context }: Route.LoaderArgs) {
	return { message: context.cloudflare.env.VALUE_FROM_CLOUDFLARE };
}

export default function Home({ loaderData }: Route.ComponentProps) {
	return <PasswordTool />;
}
