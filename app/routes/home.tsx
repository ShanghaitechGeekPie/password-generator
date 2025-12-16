import type { Route } from "./+types/home";
import PasswordTool from "../pwd/tool";

export function meta({}: Route.MetaArgs) {
	return [
		{ title: "GeekPie_ Password Generator" },
		{ name: "description", content: "根据口令生成密码" },
	];
}

export default function Home() {
	return <PasswordTool />;
}
