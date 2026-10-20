import { useEffect, useState } from "react";

import { socket } from "../socket/socket";
import type { ChatMessage } from "../socket/events";
import "./bonus.css";

const MAX_LENGTH = 50;
const MAX_SHOWN = 30; //solo guardamos los 30 ultimos mensajes

export function Chat()
{
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [text, setText] = useState("");

	useEffect(() => {
		const handleChat = (message: ChatMessage) => {
			setMessages((previous) => [...previous, message].slice(-MAX_SHOWN));
		};

		socket.on("chat", handleChat);

		return () => {
			socket.off("chat", handleChat);
		};
	}, []);

	const send = () => {
		if (text.trim() === "")
			return;

		socket.emit("chat", text);
		setText("");
	};

	return (
		<section className="column">
			<section className="column">
				<h2 className="section-title section-spaced">06 · CHAT</h2>

				{/* column-reverse: el scroll se queda abajo, en el mensaje mas nuevo */}
				<div className="chat-messages">
					{[...messages].reverse().map((message, index) => (
						<p key={index} className="chat-message">
							<span className="chat-name">{message.name}:</span> {message.text}
						</p>
					))}
				</div>

				<input
					className="chat-input"
					value={text}
					maxLength={MAX_LENGTH}
					placeholder="Mensaje (máx. 50)"
					onChange={(event) => setText(event.target.value)}
					onKeyDown={(event) => {
						event.stopPropagation(); //que las flechas y el espacio no muevan la pieza mientras escribes
						if (event.key === "Enter")
						{
							send();
							event.currentTarget.blur(); //devolvemos el foco al juego
						}
					}}
				/>
			</section>
		</section>
	);
}