import React, { useState, useMemo, useEffect } from 'react';
import { MdChevronLeft, MdChevronRight } from 'react-icons/md';
import {
    format,
    addDays,
    subDays,
    setHours,
    setMinutes,
    setSeconds,
    isBefore,
    isEqual,
    parseISO,
} from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';
import pt from 'date-fns/locale/pt';

import api from '~/services/api';
import { Container, Time } from './styles';

const range = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

export default function Dashboard() {
    const [schedule, setSchedule] = useState([]);
    const [date, setDate] = useState(new Date());

    const dateFormated = useMemo(
        () => format(date, "d 'de' MMMM", { locale: pt }),
        [date]
    );

    useEffect(() => {
        async function loadSchedule() {
            const response = await api.get('schedule', {
                params: { date },
            });

            const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

            const data = range.map(hour => {
                const checkDate = setSeconds(
                    setMinutes(setHours(date, hour), 0),
                    0
                );
                const compareDate = utcToZonedTime(checkDate, timezone);

                return {
                    time: `${hour}:00h`,
                    past: isBefore(compareDate, new Date()),
                    appointment: response.data.find(a =>
                        isEqual(parseISO(a.date), compareDate)
                    ),
                };
            });

            setSchedule(data);
        }

        loadSchedule();
    }, [date]);

    function handlePrevDate() {
        setDate(subDays(date, 1));
    }

    function handleNextDate() {
        setDate(addDays(date, 1));
    }
    return (
        <Container>
            <header>
                <button type="button" onClick={handlePrevDate}>
                    <MdChevronLeft size={36} color="#fff" />
                </button>
                <strong>{dateFormated}</strong>
                <button type="button" onClick={handleNextDate}>
                    <MdChevronRight size={36} color="#fff" />
                </button>
            </header>
            <ul>
                {schedule.map(time => (
                    <Time
                        key={time.time}
                        past={time.past}
                        avaliable={!time.appointment}
                    >
                        <strong>{time.time}</strong>
                        <span>
                            {time.appointment
                                ? time.appointment.user.name
                                : 'Em Aberto'}
                        </span>
                    </Time>
                ))}
            </ul>
        </Container>
    );
}