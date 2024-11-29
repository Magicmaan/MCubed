import React, { useState } from "react";
import Cube from "../primitives/Cube"; // Make sure to import the Cube component
import { modelContext, ModelContextProvider } from "../context/ModelContext";
import "../App.css";
import { randomCubeColour } from "../constants/CubeColours";

const ModelPartView: React.FC = () => {
	const data = React.useContext(modelContext);
	const { model, set } = data;

	return (
		<>
			<div id="Viewport Info">
				<button
					onClick={() => {
						set([
							...model,
							Cube({
								colour: randomCubeColour(),
								pos: [Math.random() * 5, Math.random() * 5, Math.random() * 5],
								scale: 1,
							}),
						]);
					}}>
					Update Model
				</button>

				{data.model
					? data.model.map((item) => (
							<div key={item.id} className="w-full">
								<p key={item.id}>
									{item.colour} {item.id}
								</p>
							</div>
					  ))
					: null}
			</div>
		</>
	);
};

export default ModelPartView;
