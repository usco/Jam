import {fromJS} from "immutable";
import atomo from "atomo";

let initialState = fromJS({
    user: null,
    albums: [
        {
            title: "La Leyenda del Tiempo",
            artist: "Camarón"
        },
        {
            title: "Veneno",
            artist: "Veneno"
        }
    ],
    playlists: [
        {
            name: "Flamenco",
            tracks: [
                {
                    title: "Nana del Caballo Grande",
                    artist: "Camarón",
                    album: "La Leyenda del Tiempo"
                }
            ]
        }
    ]
});



export const state = atomo.atom(initialState);