import React from "react";
import { Calendar, Clock, MapPin, Users, Ticket } from "lucide-react";
import "./event-card.css";

export interface EventData {
    id: string;
    image: string;
    name: string;
    date: string;
    time: string;
    place: string;
    location: string;
    spots: number;
    type: "XD";
}

interface EventCardProps {
    event: EventData;
}

export default function EventCard({ event }: EventCardProps) {
    const getBadgeClass = (type: string) => {
        switch (type) {
            case "Concert": return "badge-concert";
            case "Workshop": return "badge-workshop";
            case "Conference": return "badge-conference";
            case "Meetup": return "badge-meetup";
            default: return "badge-default";
        }
    };

    const isLowSpots = event.spots < 20;

    return (
        <div className="event-card group">
            <div className="event-image-container">
                <img src={event.image} alt={event.name} className="event-image" />
                <div className="event-badges">
                    <span className={`event-badge ${getBadgeClass(event.type)}`}>
                        {event.type}
                    </span>
                </div>
            </div>

            <div className="event-content">
                <h3 className="event-title">{event.name}</h3>

                <div className="event-details">
                    <div className="event-detail-row">
                        <Calendar className="event-detail-icon" />
                        <span>{new Date(event.date).toLocaleDateString()}</span>
                    </div>
                    <div className="event-detail-row">
                        <Clock className="event-detail-icon" />
                        <span>{event.time}</span>
                    </div>
                    <div className="event-detail-row">
                        <MapPin className="event-detail-icon" />
                        <span className="truncate">{event.place}, {event.location}</span>
                    </div>
                </div>

                <div className="event-divider" />

                <div className="event-spots">
                    <div className="event-detail-row">
                        <Ticket className="event-detail-icon" />
                        <span className="spots-label">Cupos disponibles</span>
                    </div>
                    <span className={`spots-count ${isLowSpots ? "spots-low" : ""}`}>
                        {event.spots}
                    </span>
                </div>
            </div>
        </div>
    );
}
