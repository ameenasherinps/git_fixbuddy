/* ===================================================================
   FixBuddy - Main JavaScript (Core Storage, Auth State, AI Diagnostics Engine)
   Pure Vanilla JavaScript - No Frameworks
   =================================================================== */

/**
 * Storage Keys & Constants
 */
const STORAGE_KEYS = {
  USERS: 'fixbuddy_users',
  CURRENT_USER: 'fixbuddy_currentUser',
  REPAIRS: 'fixbuddy_repairs',
  ACTIVE_REPAIR_ID: 'fixbuddy_activeRepairId'
};

/**
 * FixBuddyStore - Local Storage Management Layer
 */
const FixBuddyStore = {
  // Initialize default data if not present
  init() {
    // Seed default demo user if no users exist
    const users = this.getUsers();
    if (users.length === 0) {
      const demoUser = {
        id: 'usr_demo_1',
        name: 'Alex Morgan',
        email: 'demo@fixbuddy.com',
        password: 'password123',
        skillLevel: 'DIY Enthusiast',
        avatarText: 'AM',
        joinedDate: 'November 2026',
        createdAt: new Date().toISOString()
      };
      this.saveUser(demoUser);
    }

    // Seed realistic demo repair cases if none exist
    const repairs = this.getRepairs();
    if (repairs.length === 0) {
      this.seedInitialRepairs();
    }
  },

  getUsers() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USERS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error reading users from localStorage', e);
      return [];
    }
  },

  saveUser(user) {
    const users = this.getUsers();
    const existingIndex = users.findIndex(u => u.email.toLowerCase() === user.email.toLowerCase());
    if (existingIndex >= 0) {
      users[existingIndex] = { ...users[existingIndex], ...user };
    } else {
      users.push(user);
    }
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },

  findUserByEmail(email) {
    if (!email) return null;
    const users = this.getUsers();
    return users.find(u => u.email.toLowerCase() === email.trim().toLowerCase()) || null;
  },

  getCurrentUser() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },

  setCurrentUser(user, remember = true) {
    if (user) {
      // Do not store password in current user session
      const { password, ...safeUser } = user;
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(safeUser));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  },

  logout() {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    window.location.href = 'login.html';
  },

  getRepairs() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.REPAIRS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error reading repairs from localStorage', e);
      return [];
    }
  },

  getRepairById(id) {
    if (!id) return null;
    const repairs = this.getRepairs();
    return repairs.find(r => r.id === id) || null;
  },

  saveRepair(repair) {
    const repairs = this.getRepairs();
    const idx = repairs.findIndex(r => r.id === repair.id);
    if (idx >= 0) {
      repairs[idx] = repair;
    } else {
      repairs.unshift(repair); // Add new repairs to the top
    }
    localStorage.setItem(STORAGE_KEYS.REPAIRS, JSON.stringify(repairs));
    return repair;
  },

  deleteRepair(id) {
    let repairs = this.getRepairs();
    repairs = repairs.filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEYS.REPAIRS, JSON.stringify(repairs));
  },

  getActiveRepairId() {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_REPAIR_ID);
  },

  setActiveRepairId(id) {
    if (id) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_REPAIR_ID, id);
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_REPAIR_ID);
    }
  },

  seedInitialRepairs() {
    const initialRepairs = [
      {
        id: 'rep_1001',
        userId: 'usr_demo_1',
        category: 'Laptop',
        deviceName: 'Dell Inspiron 15 (5502)',
        problemDescription: 'My laptop turns on, keyboard backlight lights up and fan spins, but the screen remains completely black. No boot logo appears.',
        imageUrl: '',
        date: '2026-11-18T09:30:00Z',
        status: 'In Progress',
        difficulty: 'Moderate',
        estimatedTime: '25-35 mins',
        identifiedProblem: 'Display Power Interruption or RAM Contact Static Discharge',
        possibleCauses: [
          'Static charge buildup in the CMOS or embedded controller',
          'Oxidized or loose memory (RAM) contacts',
          'Faulty display ribbon cable connection or backlight inverter',
          'Corrupted BIOS boot sequence after unexpected shutdown'
        ],
        tools: [
          'Phillips #00 Screwdriver',
          'Plastic Pry Spudger',
          'Anti-Static Wrist Strap',
          'Can of Compressed Air'
        ],
        safetyPrecautions: 'CRITICAL: Disconnect the AC power adapter and internal battery before touching any internal electronic components. Ground yourself to avoid electrostatic discharge (ESD) damaging delicate microchips.',
        steps: [
          {
            title: 'Perform a Hard Power Residual Drain',
            desc: 'Unplug the charger. Press and hold down the power button continuously for 30 seconds to discharge all residual motherboard capacitors.',
            tip: 'Often fixes 40% of black-screen sleep locks without opening the case.'
          },
          {
            title: 'Test with an External Monitor',
            desc: 'Connect the laptop via HDMI to a television or computer monitor. If display output works externally, the issue is strictly the laptop screen panel or display cable.',
            tip: 'Isolates GPU failure from panel hardware.'
          },
          {
            title: 'Reseat RAM Memory Modules',
            desc: 'Open the bottom chassis screws. Carefully disconnect battery. Unclip the RAM modules, clean gold contacts with isopropyl alcohol or a clean eraser, and seat them firmly back into the slots until they click.',
            tip: 'Listen for a distinct click on both retention tabs.'
          },
          {
            title: 'Reset CMOS Real-Time Clock (RTC) Battery',
            desc: 'Unplug the small round coin-cell battery (or disconnect the main battery for 15 minutes on unified models) to clear non-volatile RAM.',
            tip: 'Forces BIOS to reload default hardware parameters upon next boot.'
          }
        ],
        alternatives: 'If display remains blank both internally and via HDMI, the GPU or processor power rail may have experienced a failed MOSFET. Consult an authorized repair specialist.',
        messages: [
          {
            sender: 'ai',
            text: 'Hello Alex! I have analyzed your Dell laptop issue. Since the fans spin and keyboard lights up, the motherboard is receiving primary 19V rail power. Would you like assistance walking through the hard reset or external monitor test?',
            time: '18 Nov, 09:31'
          },
          {
            sender: 'user',
            text: 'I tried plugging it into my TV via HDMI, and the Windows desktop showed up! So the laptop is definitely running.',
            time: '18 Nov, 09:36'
          },
          {
            sender: 'ai',
            text: 'That is great diagnostic progress! Since the HDMI output is working, your GPU and CPU are perfectly intact. The issue is narrowed down to: 1) The eDP display ribbon cable being pinched near the hinge, or 2) The backlight circuit on the LCD panel. Try shining a bright flashlight directly at the black laptop screen: do you see faint desktop icons?',
            time: '18 Nov, 09:37'
          }
        ]
      },
      {
        id: 'rep_1002',
        category: 'Mobile Phone',
        deviceName: 'Samsung Galaxy S22',
        problemDescription: 'The phone is not holding charge and discharges from 100% to 0% within two hours. Device gets unusually warm around the camera module.',
        imageUrl: '',
        date: '2026-11-15T14:15:00Z',
        status: 'Resolved',
        difficulty: 'Easy',
        estimatedTime: '15-20 mins',
        identifiedProblem: 'Background Process CPU Throttling & Battery Cell Degradation',
        possibleCauses: [
          'Background system loop consuming continuous CPU cycles',
          'Heavily degraded lithium-ion battery capacity (>600 charge cycles)',
          'Submerged moisture sensor triggering short-loop circuit'
        ],
        tools: ['System Diagnostics App', 'USB Power Meter', 'Original 25W Fast Charger'],
        safetyPrecautions: 'Never pierce, bend, or apply direct high heat to swollen lithium-ion battery packs as this presents a thermal runaway hazard.',
        steps: [
          {
            title: 'Boot into Android Safe Mode',
            desc: 'Turn off the phone. Hold power button until logo appears, then hold volume down until Safe Mode activates. Monitor if heat disappears.',
            tip: 'Safe mode disables all 3rd-party background apps.'
          },
          {
            title: 'Wipe Cache Partition',
            desc: 'Connect USB to PC, boot into recovery mode (Power + Vol Up), select "Wipe cache partition". This clears corrupt cached OS binaries without losing personal data.',
            tip: 'Resolves runaway CPU background threads.'
          },
          {
            title: 'Recalibrate Battery Sensor',
            desc: 'Charge to 100%, keep plugged in for 30 minutes, drain completely to 0% through standard usage, and charge back to 100% uninterrupted.',
            tip: 'Resets the fuel-gauge IC calibration.'
          }
        ],
        alternatives: 'If battery health is reported under 75% in Samsung Members diagnostics, replace the battery pack.',
        messages: [
          {
            sender: 'ai',
            text: 'I reviewed your Galaxy S22 battery drain. Clearing the cache partition in recovery mode is our first zero-cost step.',
            time: '15 Nov, 14:16'
          }
        ]
      },
      {
        id: 'rep_1003',
        category: 'Washing Machine',
        deviceName: 'LG Front Load Inverter',
        problemDescription: 'During high-speed spin cycle, the washing machine produces excessive shaking, loud thumping noise, and walks across the laundry room floor.',
        imageUrl: '',
        date: '2026-11-10T11:00:00Z',
        status: 'Resolved',
        difficulty: 'Easy',
        estimatedTime: '20 mins',
        identifiedProblem: 'Unbalanced Leveling Feet or Worn Suspension Shock Absorbers',
        possibleCauses: [
          'Machine is not leveled on all 4 corners',
          'Transit shipping bolts were left installed or loosened',
          'Worn friction dampeners / tub suspension struts'
        ],
        tools: ['Spirit Bubble Level', 'Adjustable Wrench', 'Anti-Vibration Rubber Pads'],
        safetyPrecautions: 'Ensure power cord is unplugged from 220V outlet and water inlet valves are turned off before moving heavy appliances.',
        steps: [
          {
            title: 'Check Bubble Level Alignment',
            desc: 'Place a bubble level diagonally across the top metal lid. Adjust the corner threaded feet with a wrench until bubble is dead center.',
            tip: 'All 4 feet must firmly touch the ground without any rocking.'
          },
          {
            title: 'Tighten Locking Nuts',
            desc: 'Turn the top lock nut on each leveling leg upward against the machine body to prevent future loosening from vibrations.',
            tip: 'Loose lock nuts allow legs to slowly unscrew.'
          },
          {
            title: 'Inspect Rear Transit Shipping Bolts',
            desc: 'Verify that the 4 rear shipping bolts used during original transport have been removed.',
            tip: 'Leaving shipping bolts in damages the suspension.'
          }
        ],
        alternatives: 'If feet are level and tub wobbles when pressed by hand, the internal hydraulic shock struts must be replaced.',
        messages: []
      }
    ];

    localStorage.setItem(STORAGE_KEYS.REPAIRS, JSON.stringify(initialRepairs));
  }
};

/**
 * AI Diagnostic Generation Engine (Domain Intelligence Simulation)
 * Analyzes device category & problem keywords to generate precise technical solutions
 */
const AIDiagnostics = {
  analyze(category, deviceName, description) {
    const descLower = (description || '').toLowerCase();
    const name = deviceName || category;

    // Default structure
    let result = {
      identifiedProblem: 'General Hardware Operation Disruption',
      difficulty: 'Moderate',
      estimatedTime: '30-45 mins',
      possibleCauses: [
        'Component physical wear or internal contact oxidation',
        'Power delivery fluctuations or capacitor aging',
        'Microcontroller firmware or driver configuration fault'
      ],
      tools: ['Precision Screwdriver Set', 'Multimeter', 'Cleaning Brush', 'Flashlight'],
      safetyPrecautions: 'CAUTION: Always disconnect mains power before opening any electronics enclosure. Do not short exposed terminals.',
      steps: [
        {
          title: 'Initial Visual & Physical Inspection',
          desc: 'Carefully examine external cables, ports, and casing for signs of heat discoloration, warping, or loose connections.',
          tip: 'A visual inspection catches 25% of hardware failures immediately.'
        },
        {
          title: 'Power Source Isolation Check',
          desc: 'Verify that the wall outlet provides standard stable voltage using a test device or multimeter. Eliminate power strip extension cords.',
          tip: 'Faulty surge protectors often cause erratic electronics behavior.'
        },
        {
          title: 'Hard Reset & Capacitance Discharge',
          desc: 'Unplug power supply, remove battery if applicable, and press the power button for 30 seconds to drain lingering capacitor energy.',
          tip: 'Clears lingering logic locks in microcontroller chips.'
        },
        {
          title: 'Clean Contacts with Isopropyl Alcohol',
          desc: 'If opening the casing, use 90%+ isopropyl alcohol with a lint-free swab to clean oxidized pins, sockets, or ribbon connectors.',
          tip: 'Allow 10 minutes to completely dry before reapplying power.'
        }
      ],
      alternatives: 'If basic hardware resets do not solve the malfunction, the issue may stem from an integrated component level fault requiring specialized micro-soldering.'
    };

    // Category & Keyword Specific Tuning
    if (category === 'Laptop' || category === 'Computer') {
      if (descLower.includes('screen') || descLower.includes('black') || descLower.includes('display')) {
        result.identifiedProblem = 'Display Panel Interruption or Static Discharge Lock';
        result.difficulty = 'Moderate';
        result.estimatedTime = '25-35 mins';
        result.possibleCauses = [
          'Residual static charge locking the Embedded Controller (EC)',
          'RAM memory contact oxidation or unseated module',
          'Loose eDP display ribbon cable behind hinge',
          'Failed backlight power rail on the motherboard'
        ];
        result.tools = ['Phillips #00 Screwdriver', 'Plastic Pry Spudger', 'HDMI Cable & External TV/Monitor', 'Anti-Static Wristband'];
        result.safetyPrecautions = 'DANGER: Always disconnect the internal battery connector before touching RAM, SSD, or display cables to prevent shorting motherboard backlights.';
        result.steps = [
          {
            title: 'Hard Power Residual Drain',
            desc: 'Unplug the charger. Press and hold down the laptop power button continuously for 30 full seconds.',
            tip: 'Forces the embedded controller to clear volatile sleep-state flags.'
          },
          {
            title: 'External Monitor Isolation Test',
            desc: 'Plug an HDMI or USB-C cable from the laptop to a TV or monitor. Boot up. If video displays externally, GPU is intact and issue is solely the panel or ribbon.',
            tip: 'Helps determine whether you need a new screen or motherboard repair.'
          },
          {
            title: 'Reseat Memory (RAM) Sticks',
            desc: 'Open bottom panel, disconnect battery, pop RAM retainer clips outwards, wipe gold fingers with a microfiber cloth, and seat firmly at a 30° angle until they click flat.',
            tip: 'Dirty RAM pins are the #1 cause of black screens where fans still spin.'
          },
          {
            title: 'Reset Real-Time Clock (RTC / CMOS)',
            desc: 'Disconnect coin-cell battery or main battery for 15 minutes to reset BIOS to factory defaults.',
            tip: 'Clears invalid memory timing parameters.'
          }
        ];
      } else if (descLower.includes('overheat') || descLower.includes('fan') || descLower.includes('hot') || descLower.includes('loud')) {
        result.identifiedProblem = 'Thermal Throttling & Heat Sink Airflow Blockage';
        result.difficulty = 'Easy';
        result.estimatedTime = '20-30 mins';
        result.possibleCauses = ['Dust accumulation in radiator fins', 'Dried out factory thermal paste', 'Fan bearing friction'];
        result.tools = ['Can of Compressed Air', 'Thermal Paste (Kryonaut / Arctic MX-4)', 'Phillips #00', 'Lint-free Swabs'];
        result.safetyPrecautions = 'Hold fan blades stationary when blowing compressed air to prevent over-spinning from back-feeding electric current into fan headers.';
        result.steps = [
          {
            title: 'Clear Radiator Dust Blanket',
            desc: 'Open rear panel. Blow short bursts of compressed air through the copper heatsink fins from the inside out.',
            tip: 'Dust often forms a solid felt-like layer between fan and exhaust.'
          },
          {
            title: 'Reapply CPU/GPU Thermal Compound',
            desc: 'Unscrew the copper heatsink in numerical sequence. Clean old dried crust with 90%+ isopropyl alcohol, then apply a pea-sized dot of fresh thermal paste.',
            tip: 'Never spread with fingers—heatsink pressure spreads it evenly.'
          }
        ];
      }
    } else if (category === 'Mobile Phone') {
      if (descLower.includes('charge') || descLower.includes('port') || descLower.includes('plug')) {
        result.identifiedProblem = 'Charging Port Contamination or Pin Oxidation';
        result.difficulty = 'Easy';
        result.estimatedTime = '10-15 mins';
        result.possibleCauses = [
          'Compacted pocket lint preventing cable connector from seating flush',
          'Oxidized CC pins in USB-C / Lightning port',
          'Faulty fast-charging power brick or broken cable core'
        ];
        result.tools = ['Wooden Toothpick or Plastic Dental Floss Pick', 'Bright Flashlight', 'Isopropyl Alcohol 90%+', 'Known-Good Cable'];
        result.safetyPrecautions = 'NEVER use metal pins, safety pins, or sewing needles inside the charging port as this can permanently short the 5V/9V VBUS power pins.';
        result.steps = [
          {
            title: 'Visual Inspection with Flashlight',
            desc: 'Look directly into the charging port. You should see a clean metal bottom and centered tongue without gray fluff.',
            tip: 'If cable wiggles or does not "click" solidly, lint is trapped.'
          },
          {
            title: 'Careful Pocket Lint Extraction',
            desc: 'Use a wooden toothpick or plastic dental pick. Gently sweep along the bottom floor of the port, working around the central connector tongue.',
            tip: 'Be extremely gentle around the central tongue contacts.'
          },
          {
            title: 'Chemical Contact Cleaning',
            desc: 'Moisten toothpick tip lightly with isopropyl alcohol. Wipe the port contact pins to remove pocket oil and carbon buildup.',
            tip: 'Allow 3 minutes to dry before plugging in the charger.'
          }
        ];
      }
    } else if (category === 'Television') {
      result.identifiedProblem = 'Backlight Array or T-Con Board Timing Sync Fault';
      result.difficulty = 'Moderate';
      result.estimatedTime = '30-40 mins';
      result.possibleCauses = [
        'HDMI handshake sync failure (HDCP)',
        'Failing LED backlight strip causing TV protection shut-off',
        'Loose ribbon cable between T-Con board and LCD panel glass'
      ];
      result.tools = ['Flashlight', 'Phillips #2 Screwdriver', 'Replacement HDMI 2.1 Cable'];
      result.safetyPrecautions = 'WARNING: High voltage power supply capacitors hold dangerous 300V-400V charge even after TV is disconnected from the wall! Never touch exposed power board traces.';
      result.steps = [
        {
          title: 'Flashlight Screen Test',
          desc: 'Turn on TV in a dark room. Shine a phone flashlight inches from the screen. If you see ghosted picture/menus, the LCD panel works and LED backlights need replacement.',
          tip: 'Isolates the display panel from the backlight power rail.'
        },
        {
          title: 'Cold Power Reset (Discharge)',
          desc: 'Unplug power cord from wall. Hold the physical power button on TV casing (not remote) for 60 seconds. Wait 10 minutes before plugging back in.',
          tip: 'Resets the mainboard EEPROM and protection fault registers.'
        },
        {
          title: 'Reseat Flat Ribbon LVDS Cables',
          desc: 'Unscrew rear backplate with TV face down on a soft mattress or blanket. Unlatch the flat ribbon cables connecting Mainboard to T-Con and reseat.',
          tip: 'Dust or micro-corrosion on LVDS pins causes flickering horizontal lines.'
        }
      ];
    } else if (category === 'Refrigerator') {
      result.identifiedProblem = 'Condenser Airflow Restriction or Defrost Drain Clogging';
      result.difficulty = 'Easy';
      result.estimatedTime = '25-30 mins';
      result.possibleCauses = [
        'Dust-choked condenser coils causing compressor overheating',
        'Frozen or clogged defrost condensation drain hole',
        'Degraded magnetic door gasket letting warm ambient air enter'
      ];
      result.tools = ['Vacuum Cleaner with Crevice Tool', 'Coil Cleaning Brush', 'Warm Water & Baster', 'Flashlight'];
      result.safetyPrecautions = 'Always pull the main 120V/240V plug before accessing the rear mechanical compartment near compressor and condenser fan.';
      result.steps = [
        {
          title: 'Vacuum Condenser Coils',
          desc: 'Pull fridge forward. Remove rear lower vent cover. Vacuum heavy dust and pet hair from coils and compressor fan blades.',
          tip: 'Clean coils can immediately lower compressor run times by 30%.'
        },
        {
          title: 'Dollar Bill Gasket Seal Test',
          desc: 'Close the fridge door on a dollar bill. Pull gently. If it slides out with zero resistance, the door gasket is leaking warm air and needs cleaning or replacement.',
          tip: 'Clean gaskets with warm soapy water to restore pliability.'
        },
        {
          title: 'Flush Defrost Drain Pipe',
          desc: 'If water pools under crisper drawers, locate the drain hole inside rear freezer/fridge. Flush with warm water and a drop of baking soda.',
          tip: 'Prevents ice sheets from building up on the floor of the compartment.'
        }
      ];
    } else if (category === 'Washing Machine') {
      result.identifiedProblem = 'Drain Pump Impeller Blockage or Tub Imbalance';
      result.difficulty = 'Easy';
      result.estimatedTime = '20 mins';
      result.possibleCauses = [
        'Foreign object (coins, hairpins, sock) caught in the drain pump filter',
        'Uneven leveling feet causing severe spin vibrations',
        'Kinked drain outlet hose'
      ];
      result.tools = ['Shallow Pan & Towels', 'Pliers', 'Spirit Level', 'Flashlight'];
      result.safetyPrecautions = 'Disconnect power and prepare for 1-2 liters of standing water when opening the lower drain filter door.';
      result.steps = [
        {
          title: 'Drain Standing Water & Clear Pump Filter',
          desc: 'Open the small access hatch at the bottom front. Place towels down. Pull emergency drain tube to release water, then unscrew filter counterclockwise to remove trapped debris.',
          tip: 'Solves 85% of washing machine "OE" or "E20" drain error codes.'
        },
        {
          title: 'Inspect Impeller Rotation',
          desc: 'Look inside the pump housing with a flashlight. Rotate the plastic impeller fan with your finger—it should click cleanly without jamming.',
          tip: 'Coins often slide between drum and lodge in the impeller.'
        },
        {
          title: 'Check Leveling Legs',
          desc: 'Press down on opposing diagonal corners of the machine. If it rocks even 2mm, adjust the threaded feet until solid on floor.',
          tip: 'Prevents machine walking and motor suspension fatigue.'
        }
      ];
    }

    return result;
  },

  // Generates smart contextual answers for chat follow-ups
  answerFollowUp(userMessage, currentRepair) {
    const q = (userMessage || '').toLowerCase();
    const cat = currentRepair ? currentRepair.category : 'Electronics';
    const problem = currentRepair ? currentRepair.identifiedProblem : 'device repair';

    if (q.includes('multimeter') || q.includes('test') || q.includes('measure') || q.includes('volt')) {
      return `To test with a multimeter:\n1. Switch your multimeter dial to DC Voltage (⎓V) mode (or 20V range).\n2. Place the black probe on a chassis ground or outer barrel of the plug.\n3. Touch the red probe to the center positive pin.\n4. You should see a steady reading matching the labeled voltage rating (e.g. 19V for laptop chargers, 5V/9V for phone fast-chargers). If voltage jumps or stays at 0V, the internal power regulator or transformer has failed.`;
    }

    if (q.includes('safe') || q.includes('shock') || q.includes('danger') || q.includes('die')) {
      return `Safety is paramount! As long as you:\n1. Unplug the device from the electrical outlet.\n2. Disconnect any internal batteries before touching circuit boards.\n3. Avoid touching large cylindrical electrolytic capacitors (which store charge), you are safe from electric shock. If you ever feel uncomfortable or see burnt solder traces, stop and let a certified technician handle it.`;
    }

    if (q.includes('still not working') || q.includes('still black') || q.includes('didn\'t work') || q.includes('failed')) {
      return `If the initial steps did not resolve the ${cat} problem, here is our secondary diagnostic checkpoint:\n• Check whether any indicator LEDs blink in a specific pattern (e.g. 2 amber blinks, 3 white blinks). Most manufacturers use this diagnostic code to identify failing components.\n• Inspect the motherboard closely for the smell of ozone or visibly swollen/burst capacitors.\n• Would you like me to guide you on how to check diagnostic error flash codes?`;
    }

    if (q.includes('where to buy') || q.includes('buy') || q.includes('parts') || q.includes('cost') || q.includes('price')) {
      return `For authentic replacement parts for your ${cat}:\n• Check reputable hardware parts distributors (such as iFixit, Parts-People, Digikey, or official manufacturer direct parts stores).\n• Always match the exact part number (e.g. DP/N on Dell, or board model on Samsung) printed directly on the component rather than just the generic device model.\n• Typical DIY savings: You can save $100–$250 in repair labor fees!`;
    }

    if (q.includes('tool') || q.includes('screwdriver') || q.includes('alternative')) {
      return `If you do not have specialized electronics repair tools:\n• In place of a plastic spudger, a clean guitar pick or old credit card works wonderfully without scratching plastics.\n• For screwdrivers, precision magnetized bits (PH00, PH0) are recommended to avoid stripping tiny screws.\n• For cleaning, make sure to use 90% or higher Isopropyl alcohol, not medical 70% rubbing alcohol which contains too much water.`;
    }

    // Contextual generic AI reply
    return `Regarding your ${cat} (${problem}): That is a very common question during this repair step. Ensure that you have disconnected all power supplies first. Take clear step-by-step photos before disconnecting any cable clips so you can easily reference their orientation when reassembling. Let me know if you would like me to elaborate on any specific step!`;
  }
};

/**
 * Toast Notifications
 */
function showToast(message, type = 'info', duration = 3500) {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span>${message}</span>
    <button style="border:none;background:none;color:var(--text-muted);font-weight:700;cursor:pointer;">&times;</button>
  `;

  const closeBtn = toast.querySelector('button');
  closeBtn.addEventListener('click', () => toast.remove());

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(50px)';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

/**
 * Navbar & Session State Renderer
 * Updates the navbar based on whether a user is logged in
 */
function initNavbar() {
  FixBuddyStore.init();
  const currentUser = FixBuddyStore.getCurrentUser();
  const navAuth = document.querySelector('.nav-auth');
  const mobileToggle = document.querySelector('.nav-mobile-toggle');
  const navLinks = document.querySelector('.nav-links');

  // Mobile menu toggle
  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', () => {
      navLinks.classList.toggle('mobile-open');
    });
  }

  if (navAuth) {
    if (currentUser) {
      // User is logged in: show avatar dropdown
      const initials = currentUser.avatarText || currentUser.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
      navAuth.innerHTML = `
        <a href="repair.html" class="btn btn-primary btn-sm">
          <span>+ New Repair</span>
        </a>
        <div class="user-dropdown-container">
          <button class="user-badge-btn" id="navUserBtn" aria-label="User Menu">
            <div class="user-avatar-circle">${initials}</div>
            <span class="user-badge-name">${currentUser.name.split(' ')[0]}</span>
            <span style="font-size: 0.7rem; color: var(--text-muted);">▼</span>
          </button>
          <div class="dropdown-menu" id="navUserMenu">
            <a href="dashboard.html" class="dropdown-item">📊 Dashboard</a>
            <a href="history.html" class="dropdown-item">🕒 Repair History</a>
            <a href="profile.html" class="dropdown-item">⚙️ Profile & Settings</a>
            <div class="dropdown-divider"></div>
            <a href="javascript:void(0)" class="dropdown-item text-danger" id="navLogoutBtn">🚪 Log Out</a>
          </div>
        </div>
      `;

      const userBtn = document.getElementById('navUserBtn');
      const userMenu = document.getElementById('navUserMenu');
      const logoutBtn = document.getElementById('navLogoutBtn');

      if (userBtn && userMenu) {
        userBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          userMenu.classList.toggle('show');
        });

        document.addEventListener('click', () => {
          userMenu.classList.remove('show');
        });
      }

      if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
          FixBuddyStore.logout();
        });
      }
    } else {
      // Guest: show Login and Signup buttons
      navAuth.innerHTML = `
        <a href="login.html" class="btn btn-ghost btn-sm">Log In</a>
        <a href="signup.html" class="btn btn-primary btn-sm">Sign Up Free</a>
      `;
    }
  }
}

// Auto init on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
});
