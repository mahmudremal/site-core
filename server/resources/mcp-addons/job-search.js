const { z } = require('zod');
const axios = require('axios');

class JobSearchAddon {
    constructor(db, logEvent) {
        this.db = db;
        this.logEvent = logEvent;
        this.name = 'job-search';
        this.supportedPlatforms = {
            'github': this._searchGitHubJobs,
            'remotive': this._searchRemotiveJobs,
            'adzuna': this._searchAdzunaJobs
        };
    }

    async init() {
        return true;
    }

    async _searchGitHubJobs(params) {
        const { description, location, full_time } = params;
        const query = [];
        if (description) query.push(`description=${encodeURIComponent(description)}`);
        if (location) query.push(`location=${encodeURIComponent(location)}`);
        if (full_time !== undefined) query.push(`full_time=${full_time ? 'true' : 'false'}`);
        const url = `https://jobs.github.com/positions.json?${query.join('&')}`;
        const { data } = await axios.get(url, { headers: { 'Accept': 'application/json' } });
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
    }

    async _searchRemotiveJobs(params) {
        const { search, category, company_name } = params;
        const url = 'https://remotive.io/api/remote-jobs';
        const res = await axios.get(url);
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
    }

    async _searchAdzunaJobs(params) {
        const { app_id, app_key, what, where, full_time } = params;
        if (!app_id || !app_key) throw new Error('Adzuna API requires app_id and app_key parameters');
        const query = [];
        if (what) query.push(`what=${encodeURIComponent(what)}`);
        if (where) query.push(`where=${encodeURIComponent(where)}`);
        if (full_time !== undefined) query.push(`full_time=${full_time ? 1 : 0}`);
        query.push('results_per_page=10');
        query.push('content-type=application/json');
        const url = `https://api.adzuna.com/v1/api/jobs/us/search/1?app_id=${app_id}&app_key=${app_key}&${query.join('&')}`;
        const { data } = await axios.get(url);
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
    }

    getTools() {
        return [
            {
                title: 'Search Jobs',
                name: 'search_jobs',
                description: 'Search jobs across platforms with filters',
                inputSchema: {
                    platform: z.enum(['github', 'remotive', 'adzuna']),
                    filters: z.record(z.any()).optional()
                },
                handler: async ({ platform, filters = {} }) => {
                    if (!(platform in this.supportedPlatforms)) {
                        return { error: 'Unsupported platform' };
                    }
                    try {
                        const results = await this.supportedPlatforms[platform].call(this, filters);
                        return { platform, results };
                    } catch (error) {
                        return { error: error.message || 'Search failed' };
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
                        description: 'Job platform to search (github, remotive, adzuna)',
                        required: true
                    },
                    {
                        name: 'filters',
                        description: 'Filters for job search such as keywords, location, full-time status',
                        required: false
                    }
                ],
                handler: async () => ({
                    description: 'Use this tool to find jobs on GitHub, Remotive, or Adzuna platforms with filters.',
                    messages: [
                        {
                            role: 'user',
                            content: {
                                type: 'text',
                                text: 'I can search for jobs on multiple platforms with various filters.'
                            }
                        }
                    ]
                })
            }
        ];
    }
}

module.exports = JobSearchAddon;