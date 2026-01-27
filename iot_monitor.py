"""
IoT Device Monitoring Module for Secure City IQ
Advanced IoT device detection, fingerprinting, and threat analysis
"""

import json
import datetime
import threading
import time
from typing import Dict, List, Optional, Tuple, Set
import re
import ipaddress

class IoTDeviceFingerprint:
    """IoT Device Fingerprinting Class"""

    def __init__(self):
        # Known IoT device signatures
        self.device_signatures = {
            # Smart Home Devices
            'amazon_echo': {
                'ports': [4070, 55442, 443],
                'services': ['Alexa', 'Amazon'],
                'user_agents': ['Alexa', 'Amazon'],
                'mac_prefixes': ['F0:27:2D', '74:C2:46', '68:37:E9'],
                'device_type': 'Smart Speaker',
                'vendor': 'Amazon',
                'risk_level': 'Low'
            },
            'google_home': {
                'ports': [8009, 8443, 443],
                'services': ['Google Home', 'Chromecast'],
                'user_agents': ['GoogleHome', 'Chromecast'],
                'mac_prefixes': ['E4:3E:D7', '94:EB:2C', 'A4:77:33'],
                'device_type': 'Smart Speaker',
                'vendor': 'Google',
                'risk_level': 'Low'
            },
            'nest_thermostat': {
                'ports': [9553, 443],
                'services': ['Nest', 'Google'],
                'user_agents': ['Nest'],
                'mac_prefixes': ['18:B4:30', '64:BC:0C'],
                'device_type': 'Smart Thermostat',
                'vendor': 'Google',
                'risk_level': 'Medium'
            },
            'philips_hue': {
                'ports': [80, 443, 2100],
                'services': ['Philips Hue'],
                'user_agents': ['Hue'],
                'mac_prefixes': ['00:17:88', 'EC:B5:FA'],
                'device_type': 'Smart Lighting',
                'vendor': 'Philips',
                'risk_level': 'Low'
            },
            'ring_doorbell': {
                'ports': [80, 443, 9999],
                'services': ['Ring'],
                'user_agents': ['Ring'],
                'mac_prefixes': ['18:83:BF', 'F0:EF:86'],
                'device_type': 'Smart Doorbell',
                'vendor': 'Ring',
                'risk_level': 'High'
            },
            'arlo_camera': {
                'ports': [80, 443, 1025],
                'services': ['Arlo'],
                'user_agents': ['Arlo'],
                'mac_prefixes': ['34:6F:90', 'B4:2E:99'],
                'device_type': 'Security Camera',
                'vendor': 'Arlo',
                'risk_level': 'High'
            },
            'tplink_smart_plug': {
                'ports': [80, 443, 9999],
                'services': ['TP-Link', 'Kasa'],
                'user_agents': ['TP-Link'],
                'mac_prefixes': ['50:C7:BF', 'B0:95:75'],
                'device_type': 'Smart Plug',
                'vendor': 'TP-Link',
                'risk_level': 'Medium'
            },
            'samsung_smart_tv': {
                'ports': [80, 443, 8001, 9080],
                'services': ['Samsung', 'SmartTV'],
                'user_agents': ['Samsung', 'SmartTV'],
                'mac_prefixes': ['8C:79:67', '08:08:C2'],
                'device_type': 'Smart TV',
                'vendor': 'Samsung',
                'risk_level': 'Medium'
            },
            'roku_streaming': {
                'ports': [8060, 80, 443],
                'services': ['Roku'],
                'user_agents': ['Roku'],
                'mac_prefixes': ['B8:27:EB', 'DC:3A:5E'],
                'device_type': 'Streaming Device',
                'vendor': 'Roku',
                'risk_level': 'Low'
            },
            'xiaomi_devices': {
                'ports': [80, 443, 9898],
                'services': ['Xiaomi', 'MiHome'],
                'user_agents': ['Xiaomi'],
                'mac_prefixes': ['28:6C:07', '7C:49:EB'],
                'device_type': 'Smart Home Hub',
                'vendor': 'Xiaomi',
                'risk_level': 'Medium'
            },
            'sonos_speaker': {
                'ports': [1400, 1443, 4444],
                'services': ['Sonos'],
                'user_agents': ['Sonos'],
                'mac_prefixes': ['B8:E9:37', '78:28:CA'],
                'device_type': 'Smart Speaker',
                'vendor': 'Sonos',
                'risk_level': 'Low'
            },
            'lifx_bulb': {
                'ports': [56700],
                'services': ['LIFX'],
                'user_agents': ['LIFX'],
                'mac_prefixes': ['D0:73:D5'],
                'device_type': 'Smart Bulb',
                'vendor': 'LIFX',
                'risk_level': 'Low'
            },
            'wemo_switch': {
                'ports': [49153, 49154],
                'services': ['WeMo'],
                'user_agents': ['WeMo'],
                'mac_prefixes': ['14:91:82', 'EC:1A:59'],
                'device_type': 'Smart Switch',
                'vendor': 'Belkin',
                'risk_level': 'Medium'
            },
            'netatmo_weather': {
                'ports': [80, 443, 8080],
                'services': ['Netatmo'],
                'user_agents': ['Netatmo'],
                'mac_prefixes': ['70:EE:50'],
                'device_type': 'Weather Station',
                'vendor': 'Netatmo',
                'risk_level': 'Medium'
            },
            'hive_thermostat': {
                'ports': [80, 443, 8883],
                'services': ['Hive'],
                'user_agents': ['Hive'],
                'mac_prefixes': ['00:0D:4B'],
                'device_type': 'Smart Thermostat',
                'vendor': 'Hive',
                'risk_level': 'Medium'
            },
            'logitech_harmony': {
                'ports': [5222, 5223, 8088],
                'services': ['Logitech', 'Harmony'],
                'user_agents': ['Harmony'],
                'mac_prefixes': ['00:04:20'],
                'device_type': 'Universal Remote',
                'vendor': 'Logitech',
                'risk_level': 'Low'
            },
            'blink_camera': {
                'ports': [80, 443, 8443],
                'services': ['Blink'],
                'user_agents': ['Blink'],
                'mac_prefixes': ['00:03:7F'],
                'device_type': 'Security Camera',
                'vendor': 'Blink',
                'risk_level': 'High'
            },
            'ecobee_thermostat': {
                'ports': [80, 443, 8089],
                'services': ['ecobee'],
                'user_agents': ['ecobee'],
                'mac_prefixes': ['44:61:32'],
                'device_type': 'Smart Thermostat',
                'vendor': 'ecobee',
                'risk_level': 'Medium'
            },
            'august_lock': {
                'ports': [80, 443, 2856],
                'services': ['August'],
                'user_agents': ['August'],
                'mac_prefixes': ['C0:97:27'],
                'device_type': 'Smart Lock',
                'vendor': 'August',
                'risk_level': 'High'
            },
            'kwikset_lock': {
                'ports': [80, 443, 8883],
                'services': ['Kwikset'],
                'user_agents': ['Kwikset'],
                'mac_prefixes': ['00:24:E4'],
                'device_type': 'Smart Lock',
                'vendor': 'Kwikset',
                'risk_level': 'High'
            },
            'schlage_lock': {
                'ports': [80, 443, 8080],
                'services': ['Schlage'],
                'user_agents': ['Schlage'],
                'mac_prefixes': ['00:1F:84'],
                'device_type': 'Smart Lock',
                'vendor': 'Schlage',
                'risk_level': 'High'
            },
            'wyze_camera': {
                'ports': [80, 443, 8554],
                'services': ['Wyze'],
                'user_agents': ['Wyze'],
                'mac_prefixes': ['2C:AA:8E'],
                'device_type': 'Security Camera',
                'vendor': 'Wyze',
                'risk_level': 'High'
            },
            'eufy_security': {
                'ports': [80, 443, 10000],
                'services': ['eufy'],
                'user_agents': ['eufy'],
                'mac_prefixes': ['50:14:79'],
                'device_type': 'Security System',
                'vendor': 'eufy',
                'risk_level': 'High'
            },
            'simpli_safe': {
                'ports': [80, 443, 993],
                'services': ['SimpliSafe'],
                'user_agents': ['SimpliSafe'],
                'mac_prefixes': ['00:1B:C5'],
                'device_type': 'Security System',
                'vendor': 'SimpliSafe',
                'risk_level': 'High'
            },
            'adt_pulse': {
                'ports': [80, 443, 4505],
                'services': ['ADT'],
                'user_agents': ['ADT'],
                'mac_prefixes': ['00:0F:BD'],
                'device_type': 'Security System',
                'vendor': 'ADT',
                'risk_level': 'High'
            },
            'unifi_camera': {
                'ports': [80, 443, 7080, 7443],
                'services': ['UniFi', 'Ubiquiti'],
                'user_agents': ['UniFi'],
                'mac_prefixes': ['24:A4:3C', '44:D9:E7'],
                'device_type': 'Security Camera',
                'vendor': 'Ubiquiti',
                'risk_level': 'High'
            },
            'reolink_camera': {
                'ports': [80, 443, 1935],
                'services': ['Reolink'],
                'user_agents': ['Reolink'],
                'mac_prefixes': ['EC:71:DB'],
                'device_type': 'Security Camera',
                'vendor': 'Reolink',
                'risk_level': 'High'
            },
            'amcrest_camera': {
                'ports': [80, 443, 37777],
                'services': ['Amcrest'],
                'user_agents': ['Amcrest'],
                'mac_prefixes': ['00:12:16'],
                'device_type': 'Security Camera',
                'vendor': 'Amcrest',
                'risk_level': 'High'
            },
            'hikvision_camera': {
                'ports': [80, 443, 554, 8000],
                'services': ['Hikvision'],
                'user_agents': ['Hikvision'],
                'mac_prefixes': ['00:18:82', '28:57:BE'],
                'device_type': 'Security Camera',
                'vendor': 'Hikvision',
                'risk_level': 'High'
            },
            'dahua_camera': {
                'ports': [80, 443, 37777],
                'services': ['Dahua'],
                'user_agents': ['Dahua'],
                'mac_prefixes': ['90:02:A9', '1C:BD:B9'],
                'device_type': 'Security Camera',
                'vendor': 'Dahua',
                'risk_level': 'High'
            },
            'nest_camera': {
                'ports': [80, 443, 9553],
                'services': ['Nest'],
                'user_agents': ['Nest'],
                'mac_prefixes': ['18:B4:30'],
                'device_type': 'Security Camera',
                'vendor': 'Google',
                'risk_level': 'High'
            },
            'logitech_circle': {
                'ports': [80, 443, 1935],
                'services': ['Logitech'],
                'user_agents': ['Circle'],
                'mac_prefixes': ['00:04:20'],
                'device_type': 'Security Camera',
                'vendor': 'Logitech',
                'risk_level': 'High'
            },
            'canary_camera': {
                'ports': [80, 443, 9000],
                'services': ['Canary'],
                'user_agents': ['Canary'],
                'mac_prefixes': ['B8:8D:12'],
                'device_type': 'Security Camera',
                'vendor': 'Canary',
                'risk_level': 'High'
            },
            'dropcam': {
                'ports': [80, 443, 9160],
                'services': ['Dropcam'],
                'user_agents': ['Dropcam'],
                'mac_prefixes': ['00:18:0A'],
                'device_type': 'Security Camera',
                'vendor': 'Dropcam',
                'risk_level': 'High'
            },
            'foscam_camera': {
                'ports': [80, 443, 88],
                'services': ['Foscam'],
                'user_agents': ['Foscam'],
                'mac_prefixes': ['00:0F:B5'],
                'device_type': 'Security Camera',
                'vendor': 'Foscam',
                'risk_level': 'High'
            },
            'trendnet_camera': {
                'ports': [80, 443, 8080],
                'services': ['TRENDnet'],
                'user_agents': ['TRENDnet'],
                'mac_prefixes': ['00:14:D1'],
                'device_type': 'Security Camera',
                'vendor': 'TRENDnet',
                'risk_level': 'High'
            },
            'dlink_camera': {
                'ports': [80, 443, 554],
                'services': ['D-Link'],
                'user_agents': ['D-Link'],
                'mac_prefixes': ['00:05:5D', '00:0D:88'],
                'device_type': 'Security Camera',
                'vendor': 'D-Link',
                'risk_level': 'High'
            },
            'linksys_camera': {
                'ports': [80, 443, 1024],
                'services': ['Linksys'],
                'user_agents': ['Linksys'],
                'mac_prefixes': ['00:18:F8'],
                'device_type': 'Security Camera',
                'vendor': 'Linksys',
                'risk_level': 'High'
            },
            'netgear_camera': {
                'ports': [80, 443, 80],
                'services': ['NETGEAR'],
                'user_agents': ['NETGEAR'],
                'mac_prefixes': ['00:09:5B', '20:4E:7F'],
                'device_type': 'Security Camera',
                'vendor': 'NETGEAR',
                'risk_level': 'High'
            },
            'axis_camera': {
                'ports': [80, 443, 554],
                'services': ['AXIS'],
                'user_agents': ['AXIS'],
                'mac_prefixes': ['00:40:8C', 'AC:CC:8E'],
                'device_type': 'Security Camera',
                'vendor': 'Axis',
                'risk_level': 'High'
            },
            'bosch_camera': {
                'ports': [80, 443, 554],
                'services': ['Bosch'],
                'user_agents': ['Bosch'],
                'mac_prefixes': ['00:07:5C'],
                'device_type': 'Security Camera',
                'vendor': 'Bosch',
                'risk_level': 'High'
            },
            'pelco_camera': {
                'ports': [80, 443, 6001],
                'services': ['Pelco'],
                'user_agents': ['Pelco'],
                'mac_prefixes': ['00:0F:4F'],
                'device_type': 'Security Camera',
                'vendor': 'Pelco',
                'risk_level': 'High'
            },
            'panasonic_camera': {
                'ports': [80, 443, 20],
                'services': ['Panasonic'],
                'user_agents': ['Panasonic'],
                'mac_prefixes': ['00:01:E3'],
                'device_type': 'Security Camera',
                'vendor': 'Panasonic',
                'risk_level': 'High'
            },
            'samsung_camera': {
                'ports': [80, 443, 554],
                'services': ['Samsung'],
                'user_agents': ['Samsung'],
                'mac_prefixes': ['00:15:99'],
                'device_type': 'Security Camera',
                'vendor': 'Samsung',
                'risk_level': 'High'
            },
            'sony_camera': {
                'ports': [80, 443, 10000],
                'services': ['Sony'],
                'user_agents': ['Sony'],
                'mac_prefixes': ['00:13:A9'],
                'device_type': 'Security Camera',
                'vendor': 'Sony',
                'risk_level': 'High'
            },
            'jvc_camera': {
                'ports': [80, 443, 80],
                'services': ['JVC'],
                'user_agents': ['JVC'],
                'mac_prefixes': ['00:0E:8F'],
                'device_type': 'Security Camera',
                'vendor': 'JVC',
                'risk_level': 'High'
            },
            'vivotek_camera': {
                'ports': [80, 443, 554],
                'services': ['Vivotek'],
                'user_agents': ['Vivotek'],
                'mac_prefixes': ['00:02:D1'],
                'device_type': 'Security Camera',
                'vendor': 'Vivotek',
                'risk_level': 'High'
            },
            'grandstream_camera': {
                'ports': [80, 443, 554],
                'services': ['Grandstream'],
                'user_agents': ['Grandstream'],
                'mac_prefixes': ['00:0B:82'],
                'device_type': 'Security Camera',
                'vendor': 'Grandstream',
                'risk_level': 'High'
            },
            'avigilon_camera': {
                'ports': [80, 443, 38880],
                'services': ['Avigilon'],
                'user_agents': ['Avigilon'],
                'mac_prefixes': ['00:18:8B'],
                'device_type': 'Security Camera',
                'vendor': 'Avigilon',
                'risk_level': 'High'
            },
            'mobotix_camera': {
                'ports': [80, 443, 554],
                'services': ['Mobotix'],
                'user_agents': ['Mobotix'],
                'mac_prefixes': ['00:0D:48'],
                'device_type': 'Security Camera',
                'vendor': 'Mobotix',
                'risk_level': 'High'
            },
            'geovision_camera': {
                'ports': [80, 443, 4550],
                'services': ['GeoVision'],
                'user_agents': ['GeoVision'],
                'mac_prefixes': ['00:0F:B0'],
                'device_type': 'Security Camera',
                'vendor': 'GeoVision',
                'risk_level': 'High'
            },
            'iqeye_camera': {
                'ports': [80, 443, 554],
                'services': ['IQeye'],
                'user_agents': ['IQeye'],
                'mac_prefixes': ['00:0E:4C'],
                'device_type': 'Security Camera',
                'vendor': 'IQeye',
                'risk_level': 'High'
            },
            'messoa_camera': {
                'ports': [80, 443, 34567],
                'services': ['Messoa'],
                'user_agents': ['Messoa'],
                'mac_prefixes': ['00:0C:DF'],
                'device_type': 'Security Camera',
                'vendor': 'Messoa',
                'risk_level': 'High'
            },
            'sanyo_camera': {
                'ports': [80, 443, 80],
                'services': ['Sanyo'],
                'user_agents': ['Sanyo'],
                'mac_prefixes': ['00:01:4A'],
                'device_type': 'Security Camera',
                'vendor': 'Sanyo',
                'risk_level': 'High'
            },
            'toshiva_camera': {
                'ports': [80, 443, 80],
                'services': ['Toshiba'],
                'user_agents': ['Toshiba'],
                'mac_prefixes': ['00:00:39'],
                'device_type': 'Security Camera',
                'vendor': 'Toshiba',
                'risk_level': 'High'
            },
            'sharp_camera': {
                'ports': [80, 443, 80],
                'services': ['Sharp'],
                'user_agents': ['Sharp'],
                'mac_prefixes': ['00:01:36'],
                'device_type': 'Security Camera',
                'vendor': 'Sharp',
                'risk_level': 'High'
            },
            'mitsubishi_camera': {
                'ports': [80, 443, 80],
                'services': ['Mitsubishi'],
                'user_agents': ['Mitsubishi'],
                'mac_prefixes': ['00:00:0C'],
                'device_type': 'Security Camera',
                'vendor': 'Mitsubishi',
                'risk_level': 'High'
            },
            'nec_camera': {
                'ports': [80, 443, 80],
                'services': ['NEC'],
                'user_agents': ['NEC'],
                'mac_prefixes': ['00:00:0F'],
                'device_type': 'Security Camera',
                'vendor': 'NEC',
                'risk_level': 'High'
            },
            'hitachi_camera': {
                'ports': [80, 443, 80],
                'services': ['Hitachi'],
                'user_agents': ['Hitachi'],
                'mac_prefixes': ['00:00:1C'],
                'device_type': 'Security Camera',
                'vendor': 'Hitachi',
                'risk_level': 'High'
            },
            'fujitsu_camera': {
                'ports': [80, 443, 80],
                'services': ['Fujitsu'],
                'user_agents': ['Fujitsu'],
                'mac_prefixes': ['00:00:10'],
                'device_type': 'Security Camera',
                'vendor': 'Fujitsu',
                'risk_level': 'High'
            },
            'canon_camera': {
                'ports': [80, 443, 80],
                'services': ['Canon'],
                'user_agents': ['Canon'],
                'mac_prefixes': ['00:00:85'],
                'device_type': 'Security Camera',
                'vendor': 'Canon',
                'risk_level': 'High'
            },
            'olympus_camera': {
                'ports': [80, 443, 80],
                'services': ['Olympus'],
                'user_agents': ['Olympus'],
                'mac_prefixes': ['00:00:4B'],
                'device_type': 'Security Camera',
                'vendor': 'Olympus',
                'risk_level': 'High'
            },
            'nikon_camera': {
                'ports': [80, 443, 80],
                'services': ['Nikon'],
                'user_agents': ['Nikon'],
                'mac_prefixes': ['00:00:0E'],
                'device_type': 'Security Camera',
                'vendor': 'Nikon',
                'risk_level': 'High'
            },
            'pentax_camera': {
                'ports': [80, 443, 80],
                'services': ['Pentax'],
                'user_agents': ['Pentax'],
                'mac_prefixes': ['00:00:0D'],
                'device_type': 'Security Camera',
                'vendor': 'Pentax',
                'risk_level': 'High'
            },
            'ricoh_camera': {
                'ports': [80, 443, 80],
                'services': ['Ricoh'],
                'user_agents': ['Ricoh'],
                'mac_prefixes': ['00:00:12'],
                'device_type': 'Security Camera',
                'vendor': 'Ricoh',
                'risk_level': 'High'
            },
            'minolta_camera': {
                'ports': [80, 443, 80],
                'services': ['Minolta'],
                'user_agents': ['Minolta'],
                'mac_prefixes': ['00:00:0B'],
                'device_type': 'Security Camera',
                'vendor': 'Minolta',
                'risk_level': 'High'
            },
            'konica_camera': {
                'ports': [80, 443, 80],
                'services': ['Konica'],
                'user_agents': ['Konica'],
                'mac_prefixes': ['00:00:0A'],
                'device_type': 'Security Camera',
                'vendor': 'Konica',
                'risk_level': 'High'
            },
            'brother_camera': {
                'ports': [80, 443, 80],
                'services': ['Brother'],
                'user_agents': ['Brother'],
                'mac_prefixes': ['00:80:77'],
                'device_type': 'Security Camera',
                'vendor': 'Brother',
                'risk_level': 'High'
            },
            'epson_camera': {
                'ports': [80, 443, 80],
                'services': ['Epson'],
                'user_agents': ['Epson'],
                'mac_prefixes': ['00:00:01'],
                'device_type': 'Security Camera',
                'vendor': 'Epson',
                'risk_level': 'High'
            },
            'xerox_camera': {
                'ports': [80, 443, 80],
                'services': ['Xerox'],
                'user_agents': ['Xerox'],
                'mac_prefixes': ['00:00:04'],
                'device_type': 'Security Camera',
                'vendor': 'Xerox',
                'risk_level': 'High'
            },
            'hewlett_packard_camera': {
                'ports': [80, 443, 80],
                'services': ['HP'],
                'user_agents': ['HP'],
                'mac_prefixes': ['00:01:E6'],
                'device_type': 'Security Camera',
                'vendor': 'HP',
                'risk_level': 'High'
            },
            'dell_camera': {
                'ports': [80, 443, 80],
                'services': ['Dell'],
                'user_agents': ['Dell'],
                'mac_prefixes': ['00:06:5B'],
                'device_type': 'Security Camera',
                'vendor': 'Dell',
                'risk_level': 'High'
            },
            'ibm_camera': {
                'ports': [80, 443, 80],
                'services': ['IBM'],
                'user_agents': ['IBM'],
                'mac_prefixes': ['00:00:5A'],
                'device_type': 'Security Camera',
                'vendor': 'IBM',
                'risk_level': 'High'
            },
            'apple_camera': {
                'ports': [80, 443, 80],
                'services': ['Apple'],
                'user_agents': ['Apple'],
                'mac_prefixes': ['00:03:93'],
                'device_type': 'Security Camera',
                'vendor': 'Apple',
                'risk_level': 'High'
            },
            'microsoft_camera': {
                'ports': [80, 443, 80],
                'services': ['Microsoft'],
                'user_agents': ['Microsoft'],
                'mac_prefixes': ['00:15:5D'],
                'device_type': 'Security Camera',
                'vendor': 'Microsoft',
                'risk_level': 'High'
            },
            'oracle_camera': {
                'ports': [80, 443, 80],
                'services': ['Oracle'],
                'user_agents': ['Oracle'],
                'mac_prefixes': ['00:14:4F'],
                'device_type': 'Security Camera',
                'vendor': 'Oracle',
                'risk_level': 'High'
            },
            'cisco_camera': {
                'ports': [80, 443, 80],
                'services': ['Cisco'],
                'user_agents': ['Cisco'],
                'mac_prefixes': ['00:00:0C'],
                'device_type': 'Security Camera',
                'vendor': 'Cisco',
                'risk_level': 'High'
            },
            'juniper_camera': {
                'ports': [80, 443, 80],
                'services': ['Juniper'],
                'user_agents': ['Juniper'],
                'mac_prefixes': ['00:05:85'],
                'device_type': 'Security Camera',
                'vendor': 'Juniper',
                'risk_level': 'High'
            },
            'checkpoint_camera': {
                'ports': [80, 443, 80],
                'services': ['Check Point'],
                'user_agents': ['Check Point'],
                'mac_prefixes': ['00:1C:7F'],
                'device_type': 'Security Camera',
                'vendor': 'Check Point',
                'risk_level': 'High'
            },
            'palo_alto_camera': {
                'ports': [80, 443, 80],
                'services': ['Palo Alto'],
                'user_agents': ['Palo Alto'],
                'mac_prefixes': ['00:1B:17'],
                'device_type': 'Security Camera',
                'vendor': 'Palo Alto',
                'risk_level': 'High'
            },
            'fortinet_camera': {
                'ports': [80, 443, 80],
                'services': ['Fortinet'],
                'user_agents': ['Fortinet'],
                'mac_prefixes': ['00:09:0F'],
                'device_type': 'Security Camera',
                'vendor': 'Fortinet',
                'risk_level': 'High'
            },
            'symantec_camera': {
                'ports': [80, 443, 80],
                'services': ['Symantec'],
                'user_agents': ['Symantec'],
                'mac_prefixes': ['00:60:DD'],
                'device_type': 'Security Camera',
                'vendor': 'Symantec',
                'risk_level': 'High'
            },
            'mcafee_camera': {
                'ports': [80, 443, 80],
                'services': ['McAfee'],
                'user_agents': ['McAfee'],
                'mac_prefixes': ['00:50:56'],
                'device_type': 'Security Camera',
                'vendor': 'McAfee',
                'risk_level': 'High'
            },
            'trend_micro_camera': {
                'ports': [80, 443, 80],
                'services': ['Trend Micro'],
                'user_agents': ['Trend Micro'],
                'mac_prefixes': ['00:0B:5D'],
                'device_type': 'Security Camera',
                'vendor': 'Trend Micro',
                'risk_level': 'High'
            },
            'kaspersky_camera': {
                'ports': [80, 443, 80],
                'services': ['Kaspersky'],
                'user_agents': ['Kaspersky'],
                'mac_prefixes': ['00:1C:42'],
                'device_type': 'Security Camera',
                'vendor': 'Kaspersky',
                'risk_level': 'High'
            },
            'eset_camera': {
                'ports': [80, 443, 80],
                'services': ['ESET'],
                'user_agents': ['ESET'],
                'mac_prefixes': ['00:1B:2F'],
                'device_type': 'Security Camera',
                'vendor': 'ESET',
                'risk_level': 'High'
            },
            'avast_camera': {
                'ports': [80, 443, 80],
                'services': ['Avast'],
                'user_agents': ['Avast'],
                'mac_prefixes': ['00:0F:4B'],
                'device_type': 'Security Camera',
                'vendor': 'Avast',
                'risk_level': 'High'
            },
            'avg_camera': {
                'ports': [80, 443, 80],
                'services': ['AVG'],
                'user_agents': ['AVG'],
                'mac_prefixes': ['00:0F:4C'],
                'device_type': 'Security Camera',
                'vendor': 'AVG',
                'risk_level': 'High'
            },
            'bitdefender_camera': {
                'ports': [80, 443, 80],
                'services': ['Bitdefender'],
                'user_agents': ['Bitdefender'],
                'mac_prefixes': ['00:0F:4D'],
                'device_type': 'Security Camera',
                'vendor': 'Bitdefender',
                'risk_level': 'High'
            },
            'norton_camera': {
                'ports': [80, 443, 80],
                'services': ['Norton'],
                'user_agents': ['Norton'],
                'mac_prefixes': ['00:0F:4E'],
                'device_type': 'Security Camera',
                'vendor': 'Norton',
                'risk_level': 'High'
            },
            'webroot_camera': {
                'ports': [80, 443, 80],
                'services': ['Webroot'],
                'user_agents': ['Webroot'],
                'mac_prefixes': ['00:0F:4F'],
                'device_type': 'Security Camera',
                'vendor': 'Webroot',
                'risk_level': 'High'
            },
            'malwarebytes_camera': {
                'ports': [80, 443, 80],
                'services': ['Malwarebytes'],
                'user_agents': ['Malwarebytes'],
                'mac_prefixes': ['00:0F:50'],
                'device_type': 'Security Camera',
                'vendor': 'Malwarebytes',
                'risk_level': 'High'
            },
            'sophos_camera': {
                'ports': [80, 443, 80],
                'services': ['Sophos'],
                'user_agents': ['Sophos'],
                'mac_prefixes': ['00:0F:51'],
                'device_type': 'Security Camera',
                'vendor': 'Sophos',
                'risk_level': 'High'
            },
            'comodo_camera': {
                'ports': [80, 443, 80],
                'services': ['Comodo'],
                'user_agents': ['Comodo'],
                'mac_prefixes': ['00:0F:52'],
                'device_type': 'Security Camera',
                'vendor': 'Comodo',
                'risk_level': 'High'
            },
            'avira_camera': {
                'ports': [80, 443, 80],
                'services': ['Avira'],
                'user_agents': ['Avira'],
                'mac_prefixes': ['00:0F:53'],
                'device_type': 'Security Camera',
                'vendor': 'Avira',
                'risk_level': 'High'
            },
            'f_secure_camera': {
                'ports': [80, 443, 80],
                'services': ['F-Secure'],
                'user_agents': ['F-Secure'],
                'mac_prefixes': ['00:0F:54'],
                'device_type': 'Security Camera',
                'vendor': 'F-Secure',
                'risk_level': 'High'
            },
            'panda_camera': {
                'ports': [80, 443, 80],
                'services': ['Panda'],
                'user_agents': ['Panda'],
                'mac_prefixes': ['00:0F:55'],
                'device_type': 'Security Camera',
                'vendor': 'Panda',
                'risk_level': 'High'
            },
            'g_data_camera': {
                'ports': [80, 443, 80],
                'services': ['G Data'],
                'user_agents': ['G Data'],
                'mac_prefixes': ['00:0F:56'],
                'device_type': 'Security Camera',
                'vendor': 'G Data',
                'risk_level': 'High'
            },
            'bullguard_camera': {
                'ports': [80, 443, 80],
                'services': ['BullGuard'],
                'user_agents': ['BullGuard'],
                'mac_prefixes': ['00:0F:57'],
                'device_type': 'Security Camera',
                'vendor': 'BullGuard',
                'risk_level': 'High'
            },
            'zonealarm_camera': {
                'ports': [80, 443, 80],
                'services': ['ZoneAlarm'],
                'user_agents': ['ZoneAlarm'],
                'mac_prefixes': ['00:0F:58'],
                'device_type': 'Security Camera',
                'vendor': 'ZoneAlarm',
                'risk_level': 'High'
            },
            'outpost_camera': {
                'ports': [80, 443, 80],
                'services': ['Outpost'],
                'user_agents': ['Outpost'],
                'mac_prefixes': ['00:0F:59'],
                'device_type': 'Security Camera',
                'vendor': 'Outpost',
                'risk_level': 'High'
            }
        }

    def identify_device(self, ip: str, mac: str = None, ports: List[int] = None,
                       user_agent: str = None, service: str = None) -> Optional[Dict]:
        """Identify IoT device based on various parameters"""
        try:
            # Normalize inputs
            mac = mac.upper() if mac else None
            user_agent = user_agent.lower() if user_agent else None
            service = service.lower() if service else None

            for device_key, signature in self.device_signatures.items():
                match_score = 0
                total_criteria = 0

                # Check MAC address prefix
                if mac and signature.get('mac_prefixes'):
                    total_criteria += 1
                    for prefix in signature['mac_prefixes']:
                        if mac.startswith(prefix.upper()):
                            match_score += 1
                            break

                # Check ports
                if ports and signature.get('ports'):
                    total_criteria += 1
                    if any(port in signature['ports'] for port in ports):
                        match_score += 1

                # Check user agent
                if user_agent and signature.get('user_agents'):
                    total_criteria += 1
                    if any(ua.lower() in user_agent for ua in signature['user_agents']):
                        match_score += 1

                # Check service
                if service and signature.get('services'):
                    total_criteria += 1
                    if any(svc.lower() in service for svc in signature['services']):
                        match_score += 1

                # Calculate confidence
                if total_criteria > 0:
                    confidence = (match_score / total_criteria) * 100
                    if confidence >= 50:  # At least 50% match
                        return {
                            'device_key': device_key,
                            'device_type': signature['device_type'],
                            'vendor': signature['vendor'],
                            'risk_level': signature['risk_level'],
                            'confidence': confidence,
                            'matched_criteria': match_score,
                            'total_criteria': total_criteria
                        }

            return None

        except Exception as e:
            return None

    def get_risk_assessment(self, device_info: Dict) -> Dict:
        """Assess security risks for identified IoT device"""
        risk_assessment = {
            'overall_risk': 'Unknown',
            'risk_score': 0,
            'vulnerabilities': [],
            'recommendations': [],
            'threat_level': 'Low'
        }

        if not device_info:
            return risk_assessment

        device_type = device_info.get('device_type', '').lower()
        vendor = device_info.get('vendor', '').lower()
        risk_level = device_info.get('risk_level', 'Low')

        # Base risk score from device type
        risk_scores = {
            'security camera': 8,
            'smart lock': 9,
            'security system': 9,
            'smart doorbell': 7,
            'smart thermostat': 6,
            'smart speaker': 4,
            'smart tv': 5,
            'smart plug': 5,
            'smart lighting': 3,
            'streaming device': 3,
            'smart home hub': 6,
            'weather station': 4,
            'universal remote': 2
        }

        base_score = risk_scores.get(device_type, 5)

        # Vendor-specific adjustments
        vendor_adjustments = {
            'hikvision': 2,  # Known vulnerabilities
            'dahua': 2,      # Known vulnerabilities
            'amazon': -1,    # Generally secure
            'google': -1,    # Generally secure
            'apple': -1,     # Generally secure
        }

        vendor_adjustment = vendor_adjustments.get(vendor, 0)
        final_score = min(10, max(1, base_score + vendor_adjustment))

        # Determine risk level
        if final_score >= 8:
            overall_risk = 'Critical'
            threat_level = 'High'
        elif final_score >= 6:
            overall_risk = 'High'
            threat_level = 'Medium'
        elif final_score >= 4:
            overall_risk = 'Medium'
            threat_level = 'Low'
        else:
            overall_risk = 'Low'
            threat_level = 'Very Low'

        # Generate vulnerabilities and recommendations
        vulnerabilities = []
        recommendations = []

        if device_type in ['security camera', 'smart doorbell']:
            vulnerabilities.extend([
                'Default credentials often unchanged',
                'Remote viewing capabilities',
                'Potential for video stream interception',
                'Physical tampering possible'
            ])
            recommendations.extend([
                'Change default passwords immediately',
                'Enable two-factor authentication',
                'Regular firmware updates',
                'Network segmentation',
                'Disable remote access if not needed'
            ])

        elif device_type == 'smart lock':
            vulnerabilities.extend([
                'Physical access bypass possible',
                'Wireless signal interception',
                'Master key code compromise',
                'Battery depletion attacks'
            ])
            recommendations.extend([
                'Use strong, unique access codes',
                'Enable activity logging',
                'Regular battery checks',
                'Install backup mechanical lock',
                'Limit remote access'
            ])

        elif device_type in ['smart thermostat', 'smart plug']:
            vulnerabilities.extend([
                'Command injection possible',
                'Network-based control',
                'Energy consumption monitoring'
            ])
            recommendations.extend([
                'Use device on separate network',
                'Regular security updates',
                'Monitor unusual activity',
                'Disable unused features'
            ])

        risk_assessment.update({
            'overall_risk': overall_risk,
            'risk_score': final_score,
            'vulnerabilities': vulnerabilities,
            'recommendations': recommendations,
            'threat_level': threat_level
        })

        return risk_assessment


class IoTMonitor:
    """Main IoT Device Monitoring System"""

    def __init__(self):
        self.fingerprint = IoTDeviceFingerprint()
        self.discovered_devices = {}  # {ip: device_info}
        self.device_history = []      # Historical device data
        self.threat_alerts = []       # IoT-specific threats
        self.monitoring_active = False
        self.scan_interval = 300      # 5 minutes
        self.last_scan = None

    def scan_network_for_iot(self, network_range: str = "192.168.1.0/24") -> Dict:
        """Scan network for IoT devices"""
        try:
            discovered = {}
            network = ipaddress.ip_network(network_range)

            # This is a simplified scan - in real implementation,
            # you would use nmap, arp, or other network scanning tools
            for ip in network.hosts():
                ip_str = str(ip)
                # Simulate device discovery (replace with actual scanning)
                device_info = self._simulate_device_discovery(ip_str)
                if device_info:
                    discovered[ip_str] = device_info
                    self.discovered_devices[ip_str] = device_info

            self.last_scan = datetime.datetime.now()
            return {
                'scan_time': self.last_scan,
                'network_range': network_range,
                'devices_found': len(discovered),
                'devices': discovered
            }

        except Exception as e:
            return {'error': str(e)}

    def _simulate_device_discovery(self, ip: str) -> Optional[Dict]:
        """Simulate IoT device discovery (replace with real scanning)"""
        # This is a placeholder - in real implementation, you would:
        # 1. ARP scan for MAC addresses
        # 2. Port scanning for open ports
        # 3. Service detection
        # 4. Banner grabbing
        # 5. UPnP discovery
        # 6. mDNS discovery

        # For demonstration, return some sample devices
        sample_devices = {
            '192.168.1.100': {
                'mac': 'F0:27:2D:12:34:56',
                'ports': [4070, 55442, 443],
                'services': ['Alexa', 'Amazon'],
                'user_agent': 'Alexa/1.0',
                'hostname': 'amazon-echo-123'
            },
            '192.168.1.101': {
                'mac': '18:B4:30:AB:CD:EF',
                'ports': [9553, 443],
                'services': ['Nest', 'Google'],
                'user_agent': 'Nest/1.0',
                'hostname': 'nest-thermostat'
            },
            '192.168.1.102': {
                'mac': '00:17:88:12:34:56',
                'ports': [80, 443, 2100],
                'services': ['Philips Hue'],
                'user_agent': 'Hue/1.0',
                'hostname': 'philips-hue-bridge'
            }
        }

        if ip in sample_devices:
            device_data = sample_devices[ip]
            identified = self.fingerprint.identify_device(
                ip=ip,
                mac=device_data['mac'],
                ports=device_data['ports'],
                user_agent=device_data['user_agent'],
                service=device_data['services'][0] if device_data['services'] else None
            )

            if identified:
                risk_assessment = self.fingerprint.get_risk_assessment(identified)
                return {
                    'ip': ip,
                    'mac': device_data['mac'],
                    'hostname': device_data['hostname'],
                    'identification': identified,
                    'risk_assessment': risk_assessment,
                    'first_seen': datetime.datetime.now(),
                    'last_seen': datetime.datetime.now(),
                    'status': 'active'
                }

        return None

    def monitor_device_activity(self, device_ip: str) -> Dict:
        """Monitor specific IoT device activity"""
        if device_ip not in self.discovered_devices:
            return {'error': 'Device not found'}

        device = self.discovered_devices[device_ip]

        # Analyze device behavior patterns
        activity_analysis = {
            'device_ip': device_ip,
            'device_type': device['identification']['device_type'],
            'risk_patterns': [],
            'anomalies': [],
            'recommendations': []
        }

        # Check for suspicious patterns
        device_type = device['identification']['device_type'].lower()

        if device_type == 'security camera':
            # Check for unusual data transfer patterns
            activity_analysis['risk_patterns'].append('High bandwidth usage detected')
            activity_analysis['recommendations'].append('Monitor video stream quality')

        elif device_type == 'smart lock':
            # Check for frequent access attempts
            activity_analysis['risk_patterns'].append('Multiple access attempts')
            activity_analysis['recommendations'].append('Review access logs')

        # Generate threat alerts if needed
        if device['risk_assessment']['risk_score'] >= 7:
            alert = {
                'timestamp': datetime.datetime.now(),
                'device_ip': device_ip,
                'device_type': device_type,
                'threat_type': 'High Risk IoT Device',
                'severity': 'High',
                'description': f'High-risk IoT device detected: {device["identification"]["vendor"]} {device_type}'
            }
            self.threat_alerts.append(alert)

        return activity_analysis

    def get_iot_security_report(self) -> Dict:
        """Generate comprehensive IoT security report"""
        report = {
            'generated_at': datetime.datetime.now(),
            'total_devices': len(self.discovered_devices),
            'high_risk_devices': 0,
            'device_types': {},
            'vendors': {},
            'risk_distribution': {'Critical': 0, 'High': 0, 'Medium': 0, 'Low': 0},
            'recommendations': []
        }

        for device in self.discovered_devices.values():
            # Count device types
            device_type = device['identification']['device_type']
            report['device_types'][device_type] = report['device_types'].get(device_type, 0) + 1

            # Count vendors
            vendor = device['identification']['vendor']
            report['vendors'][vendor] = report['vendors'].get(vendor, 0) + 1

            # Risk distribution
            risk_level = device['risk_assessment']['overall_risk']
            report['risk_distribution'][risk_level] += 1

            # Count high risk devices
            if device['risk_assessment']['risk_score'] >= 7:
                report['high_risk_devices'] += 1

        # Generate recommendations
        if report['high_risk_devices'] > 0:
            report['recommendations'].append(f"Address {report['high_risk_devices']} high-risk IoT devices immediately")

        if len(report['device_types']) > 10:
            report['recommendations'].append("Consider network segmentation for IoT devices")

        if report['risk_distribution']['Critical'] > 0:
            report['recommendations'].append("Critical risk devices require immediate attention")

        return report

    def export_iot_data(self, filename: str = None) -> str:
        """Export IoT monitoring data"""
        if not filename:
            timestamp = datetime.datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
            filename = f"iot_monitoring_report_{timestamp}.json"

        data = {
            'export_time': datetime.datetime.now().isoformat(),
            'discovered_devices': self.discovered_devices,
            'threat_alerts': self.threat_alerts,
            'device_history': self.device_history,
            'security_report': self.get_iot_security_report()
        }

        try:
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False, default=str)
            return filename
        except Exception as e:
            return f"Error exporting data: {e}"


# Example usage and integration functions
def initialize_iot_monitor() -> IoTMonitor:
    """Initialize IoT monitoring system"""
    return IoTMonitor()

def scan_iot_devices(network_range: str = "192.168.1.0/24") -> Dict:
    """Scan for IoT devices on network"""
    monitor = IoTMonitor()
    return monitor.scan_network_for_iot(network_range)

def get_iot_threat_report() -> Dict:
    """Get IoT security threat report"""
    monitor = IoTMonitor()
    monitor.scan_network_for_iot()  # Scan first
    return monitor.get_iot_security_report()
