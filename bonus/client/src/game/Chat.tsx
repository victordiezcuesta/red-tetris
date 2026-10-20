import { useState } from "react";

import { sendChat } from "../socket/socketMiddleware";
import { useRoomStore } from "../store/roomStore";
import "./bonus.css";

const MAX_LENGTH = 50;

export function Chat()
{
	const messages = useRoomStore((state) => state.messages);
	const [text, setText] = useState("");

	const send = () => {
		if (text.trim() === "")
			return;

		sendChat(text);
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