const { z } = require('zod');
const axios = require('axios');

class JobSearchAddon {
    constructor(db, logEvent) {
        this.db = db;
        this.logEvent = logEvent;
        this.name = 'jobs';
        this.supportedPlatforms = {
            'github': this._searchGitHubJobs,
            'remotive': this._searchRemotiveJobs,
            'adzuna': this._searchAdzunaJobs,
            'wiraa': this._searchWiraaJobs,
            'usajobs': this._searchUSAJobs,
            'jobs2careers': this._searchJobs2Careers,
            'careerjet': this._searchCareerJet,
            'jooble': this._searchJooble,
            'jobsdb': this._searchJobsDB,
            'glassdoor': this._searchGlassdoor,
            'reed': this._searchReed,
            'theladders': this._searchTheLadders
        };
    }

    async init() {
        return true;
    }

    // Existing GitHub implementation
    async _searchGitHubJobs(params) {
        const { description, location, full_time } = params;
        const query = [];
        if (description) query.push(`description=${encodeURIComponent(description)}`);
        if (location) query.push(`location=${encodeURIComponent(location)}`);
        if (full_time !== undefined) query.push(`full_time=${full_time ? 'true' : 'false'}`);
        
        try {
            const url = `https://jobs.github.com/positions.json?${query.join('&')}`;
            const { data } = await axios.get(url, { 
                headers: { 'Accept': 'application/json' },
                timeout: 10000
            });
            return data.map(job => ({
                id: job.id,
                title: job.title,
                company: job.company,
                location: job.location,
                type: job.type,
                url: job.url,
                created_at: job.created_at,
                description: job.description,
                platform: 'github'
            }));
        } catch (error) {
            console.warn('GitHub Jobs API may be deprecated:', error.message);
            return [];
        }
    }

    // Existing Remotive implementation
    async _searchRemotiveJobs(params) {
        const { search, category, company_name } = params;
        try {
            const url = 'https://remotive.io/api/remote-jobs';
            const res = await axios.get(url, { timeout: 10000 });
            let jobs = res.data.jobs || [];
            
            if (search) jobs = jobs.filter(job =>
                job.title.toLowerCase().includes(search.toLowerCase()) ||
                job.description.toLowerCase().includes(search.toLowerCase())
            );
            if (category) jobs = jobs.filter(job => job.category.toLowerCase() === category.toLowerCase());
            if (company_name) jobs = jobs.filter(job => job.company_name.toLowerCase().includes(company_name.toLowerCase()));
            
            return jobs.map(job => ({
                id: job.id,
                title: job.title,
                company: job.company_name,
                location: job.candidate_required_location,
                type: job.job_type,
                url: job.url,
                created_at: job.publication_date,
                description: job.description,
                platform: 'remotive'
            }));
        } catch (error) {
            console.error('Remotive API error:', error.message);
            return [];
        }
    }

    // Existing Adzuna implementation (requires API key)
    async _searchAdzunaJobs(params) {
        const { app_id, app_key, what, where, full_time } = params;
        if (!app_id || !app_key) throw new Error('Adzuna API requires app_id and app_key parameters');
        
        try {
            const query = [];
            if (what) query.push(`what=${encodeURIComponent(what)}`);
            if (where) query.push(`where=${encodeURIComponent(where)}`);
            if (full_time !== undefined) query.push(`full_time=${full_time ? 1 : 0}`);
            query.push('results_per_page=10');
            query.push('content-type=application/json');
            
            const url = `https://api.adzuna.com/v1/api/jobs/us/search/1?app_id=${app_id}&app_key=${app_key}&${query.join('&')}`;
            const { data } = await axios.get(url, { timeout: 10000 });
            
            if (!data.results) return [];
            return data.results.map(job => ({
                id: job.id,
                title: job.title,
                company: job.company.display_name,
                location: job.location.display_name,
                type: job.contract_type,
                url: job.redirect_url,
                created_at: job.created,
                description: job.description,
                platform: 'adzuna'
            }));
        } catch (error) {
            console.error('Adzuna API error:', error.message);
            return [];
        }
    }

    // New Wiraa implementation (based on your API calls)
    async _searchWiraaJobs(params) {
        const { size = 50, category_id, job_id } = params;
        try {
            if (job_id) {
                // Get specific job by ID
                const url = `https://wiraatest.azurewebsites.net/api/v1/project/banana/canadaJobsById/${job_id}`;
                const { data } = await axios.get(url, {
                    headers: {
                        'Accept': 'application/json, text/plain, */*',
                        'Cache-Control': 'no-cache'
                    },
                    timeout: 10000
                });
                return data ? [this._formatWiraaJob(data)] : [];
            } else {
                // Get job list
                const url = `https://wiraatest.azurewebsites.net/api/v1/project/banana/canadaJobSearch?Size=${size}`;
                const { data } = await axios.get(url, {
                    headers: {
                        'Accept': 'application/json, text/plain, */*',
                        'Cache-Control': 'no-cache'
                    },
                    timeout: 10000
                });
                return (data || []).map(job => this._formatWiraaJob(job));
            }
        } catch (error) {
            console.error('Wiraa API error:', error.message);
            return [];
        }
    }

    _formatWiraaJob(job) {
        return {
            id: job.id || job.jobId,
            title: job.title || job.jobTitle,
            company: job.company || job.employerName,
            location: job.location || job.city,
            type: job.type || 'Full-time',
            url: job.url || job.jobUrl,
            created_at: job.created_at || job.datePosted,
            description: job.description || job.jobDescription,
            platform: 'wiraa'
        };
    }

    // USA Jobs (US Government jobs - no API key required for basic search)
    async _searchUSAJobs(params) {
        const { keyword, location_name, position_schedule_type } = params;
        try {
            const queryParams = new URLSearchParams();
            if (keyword) queryParams.append('Keyword', keyword);
            if (location_name) queryParams.append('LocationName', location_name);
            if (position_schedule_type) queryParams.append('PositionScheduleType', position_schedule_type);
            queryParams.append('ResultsPerPage', '25');
            
            const url = `https://data.usajobs.gov/api/search?${queryParams.toString()}`;
            const { data } = await axios.get(url, {
                headers: {
                    'Host': 'data.usajobs.gov',
                    'User-Agent': 'job-search-app'
                },
                timeout: 10000
            });
            
            if (!data.SearchResult?.SearchResultItems) return [];
            
            return data.SearchResult.SearchResultItems.map(item => {
                const job = item.MatchedObjectDescriptor;
                return {
                    id: job.PositionID,
                    title: job.PositionTitle,
                    company: job.OrganizationName,
                    location: job.PositionLocationDisplay,
                    type: job.PositionScheduleType?.[0]?.Name || 'Full-time',
                    url: job.PositionURI,
                    created_at: job.PublicationStartDate,
                    description: job.UserArea?.Details?.JobSummary || '',
                    salary: job.PositionRemuneration?.[0]?.Description || '',
                    platform: 'usajobs'
                };
            });
        } catch (error) {
            console.error('USAJobs API error:', error.message);
            return [];
        }
    }

    // Jobs2Careers API (no key required for basic usage)
    async _searchJobs2Careers(params) {
        const { q, l, start = 1, limit = 10 } = params;
        try {
            const queryParams = new URLSearchParams();
            if (q) queryParams.append('q', q);
            if (l) queryParams.append('l', l);
            queryParams.append('start', start.toString());
            queryParams.append('limit', limit.toString());
            queryParams.append('format', 'json');
            
            const url = `https://api.jobs2careers.com/api/search.php?${queryParams.toString()}`;
            const { data } = await axios.get(url, { timeout: 10000 });
            
            if (!data.jobs) return [];
            
            return data.jobs.map(job => ({
                id: job.id || Math.random().toString(36),
                title: job.title,
                company: job.company,
                location: job.location,
                type: job.type || 'Full-time',
                url: job.url,
                created_at: job.date,
                description: job.description,
                platform: 'jobs2careers'
            }));
        } catch (error) {
            console.error('Jobs2Careers API error:', error.message);
            return [];
        }
    }

    // CareerJet API (requires partner ID but has free tier)
    async _searchCareerJet(params) {
        const { keywords, location, affid = 'your_affiliate_id' } = params;
        try {
            const queryParams = new URLSearchParams();
            if (keywords) queryParams.append('keywords', keywords);
            if (location) queryParams.append('location', location);
            queryParams.append('affid', affid);
            queryParams.append('user_ip', '127.0.0.1');
            queryParams.append('user_agent', 'job-search-app');
            queryParams.append('pagesize', '20');
            
            const url = `http://public-api.careerjet.com/search?${queryParams.toString()}`;
            const { data } = await axios.get(url, { timeout: 10000 });
            
            if (!data.jobs) return [];
            
            return data.jobs.map(job => ({
                id: Math.random().toString(36),
                title: job.title,
                company: job.company,
                location: job.locations,
                type: job.type,
                url: job.url,
                created_at: job.date,
                description: job.description,
                salary: job.salary,
                platform: 'careerjet'
            }));
        } catch (error) {
            console.error('CareerJet API error:', error.message);
            return [];
        }
    }

    // Jooble API (free tier available)
    async _searchJooble(params) {
        const { keywords, location, page = 1 } = params;
        try {
            const requestBody = {
                keywords: keywords || '',
                location: location || '',
                page: page.toString()
            };
            
            const url = 'https://jooble.org/api/your-api-key'; // You need to register for a free API key
            const { data } = await axios.post(url, requestBody, {
                headers: { 'Content-Type': 'application/json' },
                timeout: 10000
            });
            
            if (!data.jobs) return [];
            
            return data.jobs.map(job => ({
                id: Math.random().toString(36),
                title: job.title,
                company: job.company,
                location: job.location,
                type: job.type || 'Full-time',
                url: job.link,
                created_at: job.updated,
                description: job.snippet,
                salary: job.salary,
                platform: 'jooble'
            }));
        } catch (error) {
            console.error('Jooble API error:', error.message);
            return [];
        }
    }

    // JobsDB API (Asian markets)
    async _searchJobsDB(params) {
        const { keywords, location, country = 'sg' } = params;
        try {
            const queryParams = new URLSearchParams();
            if (keywords) queryParams.append('keywords', keywords);
            if (location) queryParams.append('location', location);
            queryParams.append('country', country);
            
            // Note: JobsDB doesn't have a public API, this is a placeholder
            // You would need to use web scraping or find an alternative API
            console.warn('JobsDB requires web scraping or partnership for API access');
            return [];
        } catch (error) {
            console.error('JobsDB API error:', error.message);
            return [];
        }
    }

    // Glassdoor API placeholder (requires partnership)
    async _searchGlassdoor(params) {
        try {
            console.warn('Glassdoor API requires partnership agreement');
            return [];
        } catch (error) {
            console.error('Glassdoor API error:', error.message);
            return [];
        }
    }

    // Reed API (UK jobs)
    async _searchReed(params) {
        const { keywords, location, api_key } = params;
        if (!api_key) {
            console.warn('Reed API requires API key registration');
            return [];
        }
        
        try {
            const queryParams = new URLSearchParams();
            if (keywords) queryParams.append('keywords', keywords);
            if (location) queryParams.append('location', location);
            queryParams.append('resultsToTake', '25');
            
            const url = `https://www.reed.co.uk/api/1.0/search?${queryParams.toString()}`;
            const { data } = await axios.get(url, {
                headers: {
                    'Authorization': `Basic ${Buffer.from(api_key + ':').toString('base64')}`
                },
                timeout: 10000
            });
            
            if (!data.results) return [];
            
            return data.results.map(job => ({
                id: job.jobId.toString(),
                title: job.jobTitle,
                company: job.employerName,
                location: job.locationName,
                type: job.contractType,
                url: job.jobUrl,
                created_at: job.date,
                description: job.jobDescription,
                salary: `${job.minimumSalary}-${job.maximumSalary}`,
                platform: 'reed'
            }));
        } catch (error) {
            console.error('Reed API error:', error.message);
            return [];
        }
    }

    // TheLadders API placeholder
    async _searchTheLadders(params) {
        try {
            console.warn('TheLadders API access requires partnership');
            return [];
        } catch (error) {
            console.error('TheLadders API error:', error.message);
            return [];
        }
    }

    // Get all available jobs from all platforms
    async searchAllPlatforms(filters = {}) {
        const allResults = [];
        const platforms = Object.keys(this.supportedPlatforms);
        
        for (const platform of platforms) {
            try {
                console.log(`Searching ${platform}...`);
                const results = await this.supportedPlatforms[platform].call(this, filters);
                allResults.push(...results);
                
                // Add delay between API calls to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (error) {
                console.error(`Error searching ${platform}:`, error.message);
            }
        }
        
        return allResults;
    }

    getTools() {
        return [
            {
                title: 'Search Jobs',
                name: 'search_jobs',
                description: 'Search jobs across platforms with filters',
                inputSchema: {
                    platform: z.enum([
                        'github', 'remotive', 'adzuna', 'wiraa', 'usajobs', 
                        'jobs2careers', 'careerjet', 'jooble', 'jobsdb', 
                        'glassdoor', 'reed', 'theladders', 'all'
                    ]),
                    filters: z.record(z.any()).optional()
                },
                handler: async ({ platform, filters = {} }) => {
                    if (platform === 'all') {
                        const results = await this.searchAllPlatforms(filters);
                        return { platform: 'all', results, count: results.length };
                    }
                    
                    if (!(platform in this.supportedPlatforms)) {
                        return { error: 'Unsupported platform' };
                    }
                    
                    try {
                        const results = await this.supportedPlatforms[platform].call(this, filters);
                        return { platform, results, count: results.length };
                    } catch (error) {
                        return { error: error.message || 'Search failed' };
                    }
                }
            },
            {
                title: 'Get Wiraa Categories',
                name: 'get_wiraa_categories',
                description: 'Get all categories from Wiraa API',
                inputSchema: {},
                handler: async () => {
                    try {
                        const { data } = await axios.get('https://wiraatest.azurewebsites.net/api/v1/static/getAllCategory', {
                            headers: {
                                'Accept': 'application/json, text/plain, */*',
                                'Cache-Control': 'no-cache'
                            },
                            timeout: 10000
                        });
                        return { categories: data };
                    } catch (error) {
                        return { error: error.message };
                    }
                }
            },
            {
                title: 'Get Wiraa Subcategories',
                name: 'get_wiraa_subcategories',
                description: 'Get subcategories by category ID from Wiraa API',
                inputSchema: {
                    category_id: z.number()
                },
                handler: async ({ category_id }) => {
                    try {
                        const { data } = await axios.get(`https://wiraatest.azurewebsites.net/api/v1/static/getSubcategoryByCatId/${category_id}`, {
                            headers: {
                                'Accept': 'application/json, text/plain, */*',
                                'Cache-Control': 'no-cache'
                            },
                            timeout: 10000
                        });
                        return { subcategories: data };
                    } catch (error) {
                        return { error: error.message };
                    }
                }
            }
        ];
    }

    getResources() {
        return [];
    }

    getPrompts() {
        return [
            {
                title: 'Job Search Assistant',
                name: 'job_search_assistant',
                description: 'Help with job search and filtering across multiple platforms',
                arguments: [
                    {
                        name: 'platform',
                        description: 'Job platform to search (github, remotive, adzuna, wiraa, usajobs, jobs2careers, careerjet, jooble, jobsdb, glassdoor, reed, theladders, all)',
                        required: true
                    },
                    {
                        name: 'filters',
                        description: 'Filters for job search such as keywords, location, full-time status',
                        required: false
                    }
                ],
                handler: async () => ({
                    description: 'Use this tool to find jobs on multiple platforms with various filters.',
                    messages: [
                        {
                            role: 'user',
                            content: {
                                type: 'text',
                                text: 'I can search for jobs on multiple platforms including GitHub, Remotive, Wiraa, USAJobs, and others with various filters.'
                            }
                        }
                    ]
                })
            }
        ];
    }
}

module.exports = JobSearchAddon;