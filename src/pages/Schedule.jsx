import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../services/supabaseClient';
import moment from 'moment';
import { motion, useInView } from 'framer-motion';
import { FaCheck, FaTimes } from 'react-icons/fa';

const Schedule = () => {
  const [currentDate, setCurrentDate] = useState(moment());
  const [schedules, setSchedules] = useState([]);
  const [courts, setCourts] = useState([]);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    fetchCourts();
    fetchSchedules();
    const timer = setInterval(() => setCurrentDate(moment()), 60000);
    return () => clearInterval(timer);
  }, []);

  const fetchCourts = async () => {
    const { data, error } = await supabase.from('courts').select('*');
    if (error) {
      console.error('Error fetching courts:', error);
    } else {
      setCourts(data);
    }
  };

  const fetchSchedules = async () => {
    const startOfWeek = moment().startOf('week');
    const endOfWeek = moment().endOf('week');
    const { data, error } = await supabase
      .from('schedules')
      .select('*, courts(name)')
      .gte('date', startOfWeek.format('YYYY-MM-DD'))
      .lte('date', endOfWeek.format('YYYY-MM-DD'))
      .order('date', { ascending: true })
      .order('start_time', { ascending: true });
    if (error) {
      console.error('Error fetching schedules:', error);
    } else {
      setSchedules(data);
    }
  };

  const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  const hours = Array.from({ length: 12 }, (_, i) => i + 10); // 10:00 to 21:00

  const getWeekDates = () => {
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      weekDates.push(moment().startOf('week').add(i, 'days'));
    }
    return weekDates;
  };

  const weekDates = getWeekDates();

  const getScheduleStatus = (hour, date, courtId) => {
    const schedule = schedules.find(s => 
      moment(s.date).isSame(date, 'day') && 
      moment(s.start_time, 'HH:mm:ss').hour() <= hour &&
      moment(s.end_time, 'HH:mm:ss').hour() > hour &&
      s.court_id === courtId
    );
    return schedule ? schedule.status : 'available';
  };

  return (
    <motion.div 
      ref={ref}
      id="schedule" 
      className="p-4 bg-contain bg-center min-h-screen pt-20" 
      style={{backgroundImage: "url('/b.png')"}}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      <motion.div 
        className="bg-opacity-90 p-4 sm:p-6 rounded-lg shadow-lg w-full max-w-6xl mx-auto"
        initial={{ y: 50, opacity: 0 }}
        animate={isInView ? { y: 0, opacity: 1 } : { y: 50, opacity: 0 }}
        transition={{ delay: 0.2, duration: 0.8 }}
      >
        <motion.h2 
          className="font-modak text-4xl sm:text-6xl text-center text-white leading-tight mb-6"
          initial={{ y: -20, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : { y: -20, opacity: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          Jadwal Lapangan
        </motion.h2>
        {courts.map((court, index) => (
          <motion.div 
            key={court.id} 
            className="mb-8"
            initial={{ y: 50, opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : { y: 50, opacity: 0 }}
            transition={{ delay: 0.2 * (index + 1), duration: 0.8 }}
          >
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-4">{court.name}</h3>
            <div className="overflow-x-auto">
              <div className="grid grid-cols-8 gap-1 text-white min-w-[640px]">
                <div></div>
                {weekDates.map((date, index) => (
                  <div key={index} className="text-center font-bold text-xs sm:text-sm">
                    <span className="hidden sm:inline">{days[date.day()]}<br/></span>
                    <span className="sm:hidden">{days[date.day()]}</span>
                    {date.format('DD/MM')}
                  </div>
                ))}
                {hours.map(hour => (
                  <React.Fragment key={hour}>
                    <div className="text-right pr-2 text-xs sm:text-sm">{hour}:00</div>
                    {weekDates.map((date, index) => {
                      const status = getScheduleStatus(hour, date, court.id);
                      return (
                        <div 
                          key={index} 
                          className={`border p-1 sm:p-2 h-8 sm:h-16 rounded-md
                            ${currentDate.hour() === hour && currentDate.isSame(date, 'day') ? 'bg-yellow-100' : 
                              status === 'booked' ? 'bg-red-300' : 'bg-green-300'} 
                            bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-20 border border-gray-100`}
                        >
                          <div className="text-xs text-white font-semibold flex justify-center items-center h-full">
                            {status === 'booked' ? <FaTimes /> : <FaCheck />}
                          </div>
                        </div>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default Schedule;